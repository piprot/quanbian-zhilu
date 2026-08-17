import {
  ACADEMY_COURSES,
  TEAM_MENTORS,
  applyPracticeAnswer,
  courseFor,
  createTeamAcademyState,
  loadTeamAcademyState,
  recruitMentor,
  saveTeamAcademyState,
  submitHomework,
  type InfluenceKey,
  type TeamAcademyState,
  type TeamRole
} from "../core/team-academy";
import {
  applyScenarioChoice,
  scenarioById,
  scenariosForRole
} from "../core/academy-scenarios";

export interface TeamAcademyCallbacks {
  onBack(): void;
  onAudio(kind: "ui" | "correct" | "wrong"): void;
  onProgress?(payload: {
    kind: "scenario" | "practice" | "homework" | "mentor";
    correct?: boolean;
    passed?: boolean;
    gained?: number;
    dimension?: InfluenceKey;
  }): void;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const DIMENSION_LABELS: Record<
  InfluenceKey,
  { zh: string; en: string }
> = {
  trust: { zh: "信任力", en: "Trust" },
  connection: { zh: "连接力", en: "Connection" },
  strategy: { zh: "战略力", en: "Strategy" },
  succession: { zh: "传承力", en: "Succession" }
};

interface StoredAcademy {
  parachute: TeamAcademyState;
  founder: TeamAcademyState;
  highPotential: TeamAcademyState;
}

function defaultStored(role: TeamRole): StoredAcademy {
  return {
    parachute: createTeamAcademyState("parachute"),
    founder: createTeamAcademyState("founder"),
    highPotential: createTeamAcademyState("highPotential")
  };
}

export class TeamAcademyApp {
  private root: HTMLElement;
  private language: "zh" | "en";
  private callbacks: TeamAcademyCallbacks;
  private currentRole: TeamRole;
  private states: StoredAcademy;
  private currentLessonId?: string;
  private currentScenarioId?: string;
  private questionIndex = 0;
  private lastAnswer?: { correct: boolean; explanation: string };
  private scenarioResult?: {
    correct: boolean;
    feedback: string;
    chosen: string;
    outcome: string;
    why: string;
    recovery: string;
    bestIndex: number;
    bestText: string;
    bestWhy: string;
    knowledge: string;
  };
  private homeworkResult?: { score: number; passed: boolean; missing: string[] };

  constructor(
    role: TeamRole,
    language: "zh" | "en",
    callbacks: TeamAcademyCallbacks
  ) {
    this.currentRole = role;
    this.language = language;
    this.callbacks = callbacks;
    this.states = this.loadStored();
    this.root = document.createElement("div");
  }

  render(container: HTMLElement): void {
    this.root = container;
    container.innerHTML = this.currentScenarioId
      ? this.renderScenario()
      : this.currentLessonId
        ? this.renderLesson()
        : this.renderIndex();
  }

  handleAction(action: string, target: HTMLElement): void {
    if (action === "ta-home") {
      this.currentLessonId = undefined;
      this.callbacks.onBack();
      return;
    }
    if (action === "ta-back") {
      this.currentLessonId = undefined;
      this.currentScenarioId = undefined;
      this.questionIndex = 0;
      this.lastAnswer = undefined;
      this.scenarioResult = undefined;
      this.homeworkResult = undefined;
      this.render(this.root);
      return;
    }
    if (action === "ta-role") {
      this.currentRole = target.dataset.role as TeamRole;
      this.currentLessonId = undefined;
      this.questionIndex = 0;
      this.lastAnswer = undefined;
      this.homeworkResult = undefined;
      this.callbacks.onAudio("ui");
      this.render(this.root);
      return;
    }
    if (action === "ta-lesson") {
      this.currentLessonId = target.dataset.lesson;
      this.currentScenarioId = undefined;
      this.questionIndex = 0;
      this.lastAnswer = undefined;
      this.scenarioResult = undefined;
      this.homeworkResult = undefined;
      this.callbacks.onAudio("ui");
      this.render(this.root);
      return;
    }
    if (action === "ta-scenario") {
      this.currentScenarioId = target.dataset.scenario;
      this.scenarioResult = undefined;
      this.callbacks.onAudio("ui");
      this.render(this.root);
      return;
    }
    if (action === "ta-scenario-option") {
      if (!this.currentScenarioId) return;
      const result = applyScenarioChoice(
        this.states[this.currentRole],
        this.currentScenarioId,
        Number(target.dataset.option)
      );
      this.states[this.currentRole] = result.state;
      this.persist();
      const scenario = scenarioById(this.currentScenarioId);
      this.scenarioResult = {
        correct: result.correct,
        feedback: result.feedback,
        chosen: scenario?.options[Number(target.dataset.option)] ?? "",
        outcome: result.path?.outcome ?? "",
        why: result.path?.why ?? "",
        recovery: result.path?.recovery ?? "",
        bestIndex: result.bestIndex,
        bestText: scenario?.options[result.bestIndex] ?? "",
        bestWhy: result.bestPath?.why ?? "",
        knowledge: scenario?.knowledge ?? ""
      };
      this.callbacks.onProgress?.({
        kind: "scenario",
        correct: result.correct,
        gained: result.gained
      });
      this.callbacks.onAudio(result.correct ? "correct" : "wrong");
      this.render(this.root);
      return;
    }
    if (action === "ta-scenario-back") {
      this.currentScenarioId = undefined;
      this.scenarioResult = undefined;
      this.callbacks.onAudio("ui");
      this.render(this.root);
      return;
    }
    if (action === "ta-next-scenario") {
      const lesson = courseFor(this.currentRole).lessons.find(
        (item) => item.scenarioIds.includes(this.currentScenarioId ?? "")
      );
      if (!lesson || !this.currentScenarioId) return;
      const index = lesson.scenarioIds.indexOf(this.currentScenarioId);
      const next = lesson.scenarioIds[index + 1];
      if (!next) return;
      this.currentScenarioId = next;
      this.scenarioResult = undefined;
      this.callbacks.onAudio("ui");
      this.render(this.root);
      return;
    }
    if (action === "ta-option") {
      const lesson = courseFor(this.currentRole).lessons.find(
        (item) => item.id === this.currentLessonId
      );
      const question = lesson?.practice[this.questionIndex];
      if (!lesson || !question) return;
      const result = applyPracticeAnswer(
        this.states[this.currentRole],
        lesson.id,
        this.questionIndex,
        Number(target.dataset.option)
      );
      this.states[this.currentRole] = result.state;
      this.persist();
      this.lastAnswer = {
        correct: result.correct,
        explanation: question.explanation
      };
      this.callbacks.onProgress?.({
        kind: "practice",
        correct: result.correct,
        gained: result.gained
      });
      this.callbacks.onAudio(result.correct ? "correct" : "wrong");
      this.render(this.root);
      return;
    }
    if (action === "ta-next-question") {
      const lesson = courseFor(this.currentRole).lessons.find(
        (item) => item.id === this.currentLessonId
      );
      if (!lesson) return;
      this.questionIndex += 1;
      this.lastAnswer = undefined;
      if (this.questionIndex >= lesson.practice.length) {
        this.questionIndex = 0;
        this.lastAnswer = undefined;
        this.render(this.root);
        return;
      }
      this.callbacks.onAudio("ui");
      this.render(this.root);
      return;
    }
    if (action === "ta-homework") {
      const lesson = courseFor(this.currentRole).lessons.find(
        (item) => item.id === this.currentLessonId
      );
      const textarea = this.root.querySelector<HTMLTextAreaElement>(
        "[data-ta-homework]"
      );
      if (!lesson || !textarea) return;
      const result = submitHomework(
        this.states[this.currentRole],
        lesson.id,
        textarea.value
      );
      this.states[this.currentRole] = result.state;
      this.persist();
      this.homeworkResult = result;
      this.callbacks.onProgress?.({
        kind: "homework",
        passed: result.passed
      });
      this.callbacks.onAudio(result.passed ? "correct" : "wrong");
      this.render(this.root);
      return;
    }
    if (action === "ta-mentor") {
      const previous = this.states[this.currentRole];
      this.states[this.currentRole] = recruitMentor(
        this.states[this.currentRole],
        target.dataset.id ?? ""
      );
      this.persist();
      const mentor = TEAM_MENTORS.find(
        (item) => item.id === target.dataset.id
      );
      this.callbacks.onProgress?.({
        kind: "mentor",
        dimension: mentor?.dimension
      });
      this.callbacks.onAudio("correct");
      this.render(this.root);
      return;
    }
    if (action === "ta-reset") {
      this.states[this.currentRole] = createTeamAcademyState(this.currentRole);
      this.persist();
      this.callbacks.onAudio("ui");
      this.render(this.root);
    }
  }

  private renderIndex(): string {
    const en = this.language === "en";
    const state = this.states[this.currentRole];
    const course = courseFor(this.currentRole);
    const lessonCards = course.lessons
      .map((lesson) => {
        const done = state.completedLessons.includes(lesson.id);
        const score = state.practiceScores[lesson.id] ?? 0;
        const homework = state.homeworkScores[lesson.id];
        const scenarioDone = lesson.scenarioIds.filter((id) =>
          state.completedScenarios.includes(id)
        ).length;
        return `
          <button class="ta-lesson-card ${done ? "done" : ""}" data-action="ta-lesson" data-lesson="${lesson.id}">
            <strong>${esc(lesson.titleZh)}</strong>
            <span>${scenarioDone}/4 ${en ? "scenarios" : "情境"} · ${en ? `${score} practice pts` : `练习分 ${score}`} · ${homework !== undefined ? (en ? "Homework done" : "作业已提交") : (en ? "Homework pending" : "作业待交")}</span>
          </button>
        `;
      })
      .join("");
    const mentors = TEAM_MENTORS.map((mentor) => {
      const active = state.mentorId === mentor.id;
      return `
        <button class="ta-mentor ${active ? "active" : ""}" data-action="ta-mentor" data-id="${mentor.id}" ${active ? "disabled aria-disabled=\"true\"" : ""}>
          <strong>${esc(mentor.nameZh)}</strong>
          <span>${esc(mentor.skill)}</span>
        </button>
      `;
    }).join("");
    const roleTabs = (["parachute", "founder", "highPotential"] as TeamRole[])
      .map(
        (role) => `
          <button class="${this.currentRole === role ? "active" : ""}" data-action="ta-role" data-role="${role}">${esc(courseFor(role).titleZh.split("·")[0].trim())}</button>
        `
      )
      .join("");
    return `
      <header class="topbar">
        <div class="brand">${en ? "Ascend" : "升维"}</div>
        <button class="link" data-action="ta-home">${en ? "Menu" : "返回主菜单"}</button>
        <div class="topbar-meta"><span>${en ? "Team Academy" : "团队管理训练营"}</span></div>
      </header>
      <main class="ta-shell" aria-label="${en ? "Team Management Academy" : "团队管理训练营"}">
        <section class="ta-hero">
          <p class="eyebrow">${en ? "Three roles, one management system" : "三类角色，一套管理系统"}</p>
          <h1>${esc(en ? course.titleEn : course.titleZh)}</h1>
          <p class="muted">${esc(en ? course.summary : course.summary)}</p>
          <p class="muted">${en ? "Academy influence maps back to the campaign's ten abilities and the five-dimension leadership model, so progress here feeds your overall profile." : "训练营影响力会映射回主线的十项能力与五维领导力模型，训练成果计入整体档案。"}</p>
          <div class="ta-roles">${roleTabs}</div>
        </section>
        <section class="ta-panel">
          <h2>${en ? "Academy Influence" : "学院影响力"}</h2>
          <div class="ta-dimensions">
            ${(Object.keys(DIMENSION_LABELS) as InfluenceKey[])
              .map((key) => {
                const value = state.dimensions[key];
                return `
                  <div class="ta-dim">
                    <span>${esc(DIMENSION_LABELS[key].zh)}</span>
                    <b>${value}</b>
                    <i><em style="width:${Math.min(100, value)}%"></em></i>
                  </div>
                `;
              })
              .join("")}
          </div>
        </section>
        <section class="ta-panel">
          <h2>${en ? "Mentor to cover blind spots" : "选择导师补短板"}</h2>
          <div class="ta-mentors">${mentors}</div>
          <p class="muted">${en ? "One mentor can be recruited per run to boost a weak dimension." : "每次训练可选择一位导师，为对应维度 +8。"}</p>
        </section>
        <section class="ta-panel">
          <h2>${en ? "Course" : "课程"}</h2>
          <div class="ta-lessons">${lessonCards}</div>
          <button data-action="ta-reset">${en ? "Reset Course" : "重置本课程"}</button>
        </section>
      </main>
    `;
  }

  private renderScenario(): string {
    const en = this.language === "en";
    const scenario = this.currentScenarioId
      ? scenarioById(this.currentScenarioId)
      : undefined;
    if (!scenario || scenario.role !== this.currentRole) {
      return this.renderLesson();
    }
    const options = scenario.options
      .map(
        (option, index) => `
          <button class="ta-play-option" data-action="ta-scenario-option" data-option="${index}" ${this.scenarioResult ? "disabled aria-disabled=\"true\"" : ""}>${esc(option)}</button>
        `
      )
      .join("");
    const lesson = courseFor(this.currentRole).lessons.find((item) =>
      item.scenarioIds.includes(scenario.id)
    );
    const scenarioIndex = lesson
      ? lesson.scenarioIds.indexOf(scenario.id)
      : 0;
    const nextId = lesson?.scenarioIds[scenarioIndex + 1];
    const result = this.scenarioResult
      ? `<div class="ta-feedback ${this.scenarioResult.correct ? "correct" : "wrong"}">
            <strong>${this.scenarioResult.correct ? (en ? "Good call" : "判断正确") : (en ? "Review the path" : "需要复盘")}</strong>
            <p>${esc(this.scenarioResult.feedback)}</p>
          </div>
          <section class="ta-panel ta-path-review">
            <h2>${en ? "Your Path" : "你选择的路径"}</h2>
            <p class="ta-path-choice"><b>${en ? "Choice" : "你选了"}：</b>${esc(this.scenarioResult.chosen)}</p>
            <p><b>${en ? "Result" : "结果"}：</b>${esc(this.scenarioResult.outcome)}</p>
            <p><b>${en ? "Why" : "为什么"}：</b>${esc(this.scenarioResult.why)}</p>
            <p><b>${en ? "Recovery" : "补救"}：</b>${esc(this.scenarioResult.recovery)}</p>
          </section>
          <section class="ta-panel ta-best-path">
            <h2>${en ? "Best Path" : "最优路径"}</h2>
            <p class="ta-path-choice"><b>${en ? "Best" : "最优"}（${this.scenarioResult.bestIndex + 1}/4）：</b>${esc(this.scenarioResult.bestText)}</p>
            <p><b>${en ? "Why" : "为什么"}：</b>${esc(this.scenarioResult.bestWhy)}</p>
            <p class="ta-knowledge"><b>${en ? "Knowledge" : "知识点"}：</b>${esc(this.scenarioResult.knowledge)}</p>
          </section>`
      : "";
    const nextAction = this.scenarioResult && nextId
      ? `<button class="primary" data-action="ta-next-scenario">${en ? "Next Scenario" : "下一个情境"}</button>`
      : "";
    return `
      <header class="topbar">
        <div class="brand">${en ? "Ascend" : "升维"}</div>
        <button class="link" data-action="ta-scenario-back">${en ? "Lesson" : "返回本课"}</button>
        <div class="topbar-meta"><span>${esc(scenario.title)}</span></div>
      </header>
      <main class="ta-shell ta-scenario-play" aria-label="${esc(scenario.title)}">
        <section class="ta-play-hero">
          <p class="eyebrow">${en ? `Level ${scenario.level} · Scenario ${scenarioIndex + 1}/4` : `第 ${scenario.level} 关 · 情境 ${scenarioIndex + 1}/4`}</p>
          <h1>${esc(scenario.title)}</h1>
          <p>${esc(scenario.situation)}</p>
        </section>
        ${result}
        <section class="ta-play-options">${options}</section>
        <div class="ta-actions"><button class="primary" data-action="ta-scenario-back">${en ? "Back to Lesson" : "返回本课"}</button>${nextAction}</div>
      </main>
    `;
  }

  private renderLesson(): string {
    const en = this.language === "en";
    const lesson = courseFor(this.currentRole).lessons.find(
      (item) => item.id === this.currentLessonId
    );
    if (!lesson) return this.renderIndex();
    const state = this.states[this.currentRole];
    const question = lesson.practice[this.questionIndex];
    const practiceMarkup = question
      ? `
        <section class="ta-practice">
          <p class="eyebrow">${en ? `Practice ${this.questionIndex + 1}/${lesson.practice.length}` : `练习题 ${this.questionIndex + 1}/${lesson.practice.length}`}</p>
          <h3>${esc(question.prompt)}</h3>
          <div class="ta-options">
            ${question.options
              .map(
                (option, index) => `
                  <button data-action="ta-option" data-option="${index}" ${this.lastAnswer ? "disabled aria-disabled=\"true\"" : ""}>${esc(option)}</button>
                `
              )
              .join("")}
          </div>
          ${
            this.lastAnswer
              ? `<div class="ta-feedback ${this.lastAnswer.correct ? "correct" : "wrong"}">
                  <strong>${this.lastAnswer.correct ? (en ? "Correct" : "答对了") : (en ? "Keep thinking" : "再想想")}</strong>
                  <p>${esc(this.lastAnswer.explanation)}</p>
                  <button data-action="ta-next-question">${this.questionIndex + 1 >= lesson.practice.length ? (en ? "Finish Practice" : "完成练习") : (en ? "Next Question" : "下一题")}</button>
                </div>`
              : ""
          }
        </section>
      `
      : `<p class="muted">${en ? "Practice complete." : "练习完成。"}</p>`;
    const homeworkMarkup = `
      <section class="ta-homework">
        <h2>${en ? "Homework" : "作业"}</h2>
        <p>${esc(lesson.homework)}</p>
        <textarea data-ta-homework rows="4" maxlength="800" placeholder="${en ? "Write your homework here." : "在这里写下你的作业。"}"></textarea>
        <button data-action="ta-homework">${en ? "Submit Homework" : "提交作业"}</button>
        ${
          this.homeworkResult
            ? `<div class="ta-feedback ${this.homeworkResult.passed ? "correct" : "wrong"}">
                <strong>${this.homeworkResult.passed ? (en ? "Passed" : "作业通过") : (en ? "Needs revision" : "需要补充")} · ${this.homeworkResult.score}/100</strong>
                ${this.homeworkResult.missing.length ? `<p>${en ? "Missing keywords" : "缺少关键词"}：${esc(this.homeworkResult.missing.join("、"))}</p>` : ""}
              </div>`
            : ""
        }
      </section>
    `;
    const modelSteps = lesson.model.map((step) => `<li>${esc(step)}</li>`).join("");
    const examples = lesson.examples.map((item) => `<li>${esc(item)}</li>`).join("");
    const checklist = (lesson.checklist ?? [])
      .map((item) => `<li>${esc(item)}</li>`)
      .join("");
    return `
      <header class="topbar">
        <div class="brand">${en ? "Ascend" : "升维"}</div>
        <button class="link" data-action="ta-back">${en ? "Course" : "返回课程"}</button>
        <div class="topbar-meta"><span>${esc(lesson.titleZh)}</span></div>
      </header>
      <main class="ta-shell ta-lesson-shell" aria-label="${esc(lesson.titleZh)}">
        <section class="ta-lesson-hero">
          <p class="eyebrow">${en ? "Step 1 · Scenario" : "第 1 步 · 情境引入"}</p>
          <h1>${esc(lesson.titleZh)}</h1>
          <p>${esc(lesson.scenario)}</p>
        </section>
        <section class="ta-panel">
          <h2>${en ? "4 Scenarios" : "本关 4 个情境"}</h2>
          <div class="ta-scenarios">
            ${scenariosForRole(this.currentRole)
              .filter((scenario) => lesson.scenarioIds.includes(scenario.id))
              .map((scenario) => {
                const done = state.completedScenarios.includes(scenario.id);
                const score = state.scenarioScores[scenario.id] ?? 0;
                return `
                  <button class="ta-scenario-card ${done ? "done" : ""}" data-action="ta-scenario" data-scenario="${scenario.id}">
                    <strong>${esc(scenario.title)}</strong>
                    <span>${done ? (en ? "Done" : "已完成") : (en ? "Not started" : "未开始")}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </section>
        <section class="ta-panel">
          <p class="eyebrow">${en ? "Step 2 · Concept" : "第 2 步 · 概念讲解"}</p>
          <h2>${esc(lesson.concept)}</h2>
        </section>
        <section class="ta-panel">
          <p class="eyebrow">${en ? "Step 3 · Formula" : "第 3 步 · 公式推导"}</p>
          <div class="ta-formula">${esc(lesson.formula)}</div>
        </section>
        <section class="ta-panel">
          <p class="eyebrow">${en ? "Step 4 · Model" : "第 4 步 · 解题模型"}</p>
          <ol>${modelSteps}</ol>
        </section>
        <section class="ta-panel">
          <p class="eyebrow">${en ? "Step 5 · Transfer" : "第 5 步 · 举一反三"}</p>
          <ul>${examples}</ul>
        </section>
        <section class="ta-panel">
          <p class="eyebrow">${en ? "Step 6 · Action Checklist" : "第 6 步 · 落地清单"}</p>
          <h2>${en ? "This week, complete these five actions" : "本周完成这 5 个动作"}</h2>
          <ol>${checklist}</ol>
        </section>
        ${practiceMarkup}
        ${homeworkMarkup}
        <div class="ta-actions"><button class="primary" data-action="ta-back">${en ? "Back to Course" : "返回课程"}</button></div>
      </main>
    `;
  }

  private loadStored(): StoredAcademy {
    const fallback = defaultStored(this.currentRole);
    try {
      const raw = localStorage.getItem("adaptive-ascent-team-academy-v1");
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Partial<StoredAcademy>;
      return {
        parachute: parsed.parachute ?? fallback.parachute,
        founder: parsed.founder ?? fallback.founder,
        highPotential: parsed.highPotential ?? fallback.highPotential
      };
    } catch {
      return fallback;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(
        "adaptive-ascent-team-academy-v1",
        JSON.stringify(this.states)
      );
    } catch {
      // storage failure should not block the lesson view
    }
  }
}
