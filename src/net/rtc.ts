import type { AbilityId, ResourceKey } from "../core/types";

export type RtcSignal = {
  type: "offer" | "answer";
  sdp: string;
  seed?: number;
};

export type RtcMessage =
  | {
      kind: "hello";
      name: string;
      role: string;
      roundCount: number;
      abilities: Record<AbilityId, number>;
      resources: Record<ResourceKey, number>;
    }
  | { kind: "picked" }
  | { kind: "reveal"; optionIndex: number }
  | { kind: "next" }
  | { kind: "result"; winnerName: string; scores: [number, number] };

const STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" }
];

/** STUN 之外，允许通过构建变量注入 TURN（无 TURN 时保持纯 STUN 降级）。 */
function iceServers(): RTCIceServer[] {
  const servers = [...STUN_SERVERS];
  const turnUrl = import.meta.env.VITE_TURN_URL;
  if (typeof turnUrl === "string" && turnUrl.trim()) {
    const turnServer: RTCIceServer = { urls: turnUrl.trim() };
    const username = import.meta.env.VITE_TURN_USERNAME;
    const credential = import.meta.env.VITE_TURN_CREDENTIAL;
    if (username && credential) {
      turnServer.username = username;
      turnServer.credential = credential;
    }
    servers.push(turnServer);
  }
  return servers;
}

export class ManualRtcPeer {
  readonly pc: RTCPeerConnection;
  readonly seed: number;
  private channel?: RTCDataChannel;
  private isHost: boolean;
  private messageQueue: RtcMessage[] = [];
  onOpen?: () => void;
  onMessage?: (message: RtcMessage) => void;
  onStatus?: (status: string) => void;

  private constructor(
    pc: RTCPeerConnection,
    isHost: boolean,
    seed: number
  ) {
    this.pc = pc;
    this.isHost = isHost;
    this.seed = seed;
    this.pc.onconnectionstatechange = () => {
      this.onStatus?.(this.pc.connectionState);
      if (this.pc.connectionState === "connected") {
        this.flushQueue();
      }
    };
    this.pc.oniceconnectionstatechange = () => {
      this.onStatus?.(this.pc.iceConnectionState);
    };
  }

  static async createHost(seed: number): Promise<{
    peer: ManualRtcPeer;
    inviteCode: string;
  }> {
    const pc = createPeerConnection();
    const peer = new ManualRtcPeer(pc, true, seed);
    const channel = pc.createDataChannel("adaptive-ascent", { ordered: true });
    peer.bindChannel(channel);
    const offer = await pc.createOffer({ offerToReceiveAudio: false });
    await pc.setLocalDescription(offer);
    await waitForIceComplete(pc);
    const signal: RtcSignal = {
      type: "offer",
      sdp: pc.localDescription?.sdp ?? "",
      seed
    };
    return {
      peer,
      inviteCode: encodeSignal(signal)
    };
  }

  static async join(code: string): Promise<{
    peer: ManualRtcPeer;
    answerCode: string;
  }> {
    const signal = decodeSignal(code);
    if (signal.type !== "offer" || !signal.sdp) {
      throw new Error("邀请码不是有效的创建方代码");
    }
    const pc = createPeerConnection();
    const peer = new ManualRtcPeer(pc, false, signal.seed ?? 1);
    pc.ondatachannel = (event) => {
      peer.bindChannel(event.channel);
    };
    await pc.setRemoteDescription({
      type: "offer",
      sdp: signal.sdp
    });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await waitForIceComplete(pc);
    const answerSignal: RtcSignal = {
      type: "answer",
      sdp: pc.localDescription?.sdp ?? ""
    };
    return {
      peer,
      answerCode: encodeSignal(answerSignal)
    };
  }

  async acceptAnswer(code: string): Promise<void> {
    const signal = decodeSignal(code);
    if (signal.type !== "answer" || !signal.sdp) {
      throw new Error("对方代码无效");
    }
    await this.pc.setRemoteDescription({
      type: "answer",
      sdp: signal.sdp
    });
  }

  send(message: RtcMessage): void {
    if (this.channel?.readyState === "open") {
      this.channel.send(JSON.stringify(message));
      return;
    }
    this.messageQueue.push(message);
  }

  close(): void {
    this.channel?.close();
    this.pc.close();
  }

  private bindChannel(channel: RTCDataChannel): void {
    this.channel = channel;
    channel.onopen = () => {
      this.onOpen?.();
      this.flushQueue();
    };
    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as RtcMessage;
        this.onMessage?.(message);
      } catch {
        this.onStatus?.("收到无法解析的消息");
      }
    };
    channel.onclose = () => {
      this.onStatus?.("连接已关闭");
    };
  }

  private flushQueue(): void {
    if (!this.channel || this.channel.readyState !== "open") {
      return;
    }
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.channel.send(JSON.stringify(message));
      }
    }
  }
}

function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: iceServers(),
    iceCandidatePoolSize: 4
  });
}

function encodeSignal(signal: RtcSignal): string {
  return btoa(JSON.stringify(signal));
}

function decodeSignal(code: string): RtcSignal {
  const raw = atob(code.trim());
  const parsed = JSON.parse(raw) as RtcSignal;
  if (parsed.type !== "offer" && parsed.type !== "answer") {
    throw new Error("代码格式不正确");
  }
  return parsed;
}

function waitForIceComplete(pc: RTCPeerConnection): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") {
      resolve();
      return;
    }
    const timer = window.setTimeout(() => resolve(), 8000);
    pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") {
        window.clearTimeout(timer);
        resolve();
      }
    });
  });
}
