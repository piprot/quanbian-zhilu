import type { SaveState } from "../core/types";

export type RoomServerMessage =
  | { type: "connected"; message: string }
  | { type: "registered"; token: string; account: unknown }
  | { type: "recovery_reissued"; code: string; account: unknown }
  | { type: "logged_in"; account: unknown }
  | { type: "save_ok" }
  | { type: "logged_out" }
  | {
      type: "leaderboard";
      entries: Array<{
        name: string;
        role: string;
        score: number;
        percentile?: number;
      }>;
    }
  | { type: "room_created"; roomId: string }
  | { type: "match_started"; roomId: string; playerIndex: number; opponentName?: string }
  | { type: "queued" }
  | { type: "picked" }
  | { type: "reveal"; optionIndex: number }
  | { type: "signal"; signal: unknown }
  | { type: "opponent_left" }
  | { type: "error"; message: string };

export class RoomClient {
  private socket?: WebSocket;
  private url: string;
  onMessage?: (message: RoomServerMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  token?: string;

  constructor(url = import.meta.env.VITE_ROOM_SERVER_URL || "ws://127.0.0.1:8080") {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.socket = socket;
      socket.onopen = () => {
        this.onOpen?.();
        resolve();
      };
      socket.onmessage = (event) => {
        try {
          this.onMessage?.(JSON.parse(String(event.data)) as RoomServerMessage);
        } catch {
          // ignore malformed messages
        }
      };
      socket.onclose = () => this.onClose?.();
      socket.onerror = () => reject(new Error("无法连接房间服务器"));
    });
  }

  send(payload: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  register(
    name: string,
    role: string,
    save: SaveState,
    recoveryCode?: string,
    username?: string,
    password?: string
  ): void {
    this.send({
      type: "register",
      name,
      role,
      save,
      recoveryCode,
      username,
      password
    });
  }

  login(token: string): void {
    this.token = token;
    this.send({ type: "login", token });
  }

  loginRecovery(code: string): void {
    this.send({ type: "login_recovery", code });
  }

  loginPassword(username: string, password: string): void {
    this.send({ type: "login_password", username, password });
  }

  cloudSave(token: string, save: SaveState): void {
    this.token = token;
    this.send({ type: "cloud_save", token, save });
  }

  logout(token: string): void {
    this.send({ type: "logout", token });
  }

  leaderboard(): void {
    this.send({ type: "leaderboard" });
  }

  createRoom(name: string, role: string, save: SaveState, rounds: number): void {
    this.send({ type: "create_room", name, role, save, rounds });
  }

  joinRoom(roomId: string, name: string, role: string, save: SaveState): void {
    this.send({ type: "join_room", roomId, name, role, save });
  }

  match(name: string, role: string, save: SaveState, rounds: number): void {
    this.send({ type: "match", name, role, save, rounds });
  }

  reconnect(
    roomId: string,
    name: string,
    role: string,
    save: SaveState
  ): void {
    this.send({ type: "reconnect", roomId, name, role, save });
  }

  pick(optionIndex: number): void {
    this.send({ type: "pick", optionIndex });
  }

  reveal(optionIndex: number): void {
    this.send({ type: "reveal", optionIndex });
  }

  signal(signal: unknown): void {
    this.send({ type: "signal", signal });
  }

  close(): void {
    this.socket?.close();
  }
}
