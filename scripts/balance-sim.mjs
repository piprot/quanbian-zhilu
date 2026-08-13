import {
  CHAPTER_PASS_STARS,
  DEFAULT_SAVE,
  applyStoryChoice,
  chapterStarCount,
  isChapterPassed
} from "../src/core/game.ts";
import { CHAPTERS, nodesForChapter } from "../src/core/story.ts";

const RUNS = Number(process.argv[2] ?? 1000);

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function simulateOnce(seed) {
  const random = seededRandom(seed);
  const save = structuredClone(DEFAULT_SAVE);
  const stars = {};
  for (const chapter of CHAPTERS) {
    const nodes = nodesForChapter(chapter.id).filter(
      (node) => node.kind === "main"
    );
    for (const node of nodes) {
      const optionIndex = Math.floor(random() * node.options.length);
      applyStoryChoice(save, node.id, optionIndex);
    }
    stars[chapter.id] = {
      total:
        save.chapterRecords.find((record) => record.chapterId === chapter.id)
          ?.stars ?? 0,
      count: chapterStarCount(
        save.chapterRecords.find((record) => record.chapterId === chapter.id)
          ?.stars ?? 0
      )
    };
    if (chapter.id < CHAPTERS.length) {
      save.unlockedChapters.push(chapter.id + 1);
    }
  }
  return {
    stars,
    passed: CHAPTERS.filter((chapter) => isChapterPassed(save, chapter.id))
      .length,
    finalAbility: Object.values(save.profile.abilities).reduce(
      (sum, value) => sum + value,
      0
    ),
    playCount: save.playCount
  };
}

const results = [];
for (let i = 0; i < RUNS; i += 1) {
  results.push(simulateOnce(i * 7919 + 17));
}

const chapterStats = CHAPTERS.map((chapter) => {
  const values = results.map((result) => result.stars[chapter.id]);
  const passRate =
    values.filter((item) => item.total >= CHAPTER_PASS_STARS).length / RUNS;
  const starDist = [0, 1, 2, 3].map(
    (stars) =>
      values.filter((item) => item.count === stars).length / RUNS
  );
  const average =
    values.reduce((sum, item) => sum + item.total, 0) / RUNS;
  return {
    chapter: chapter.id,
    averageScore: Number(average.toFixed(1)),
    passRate: Number(passRate.toFixed(3)),
    starDist: starDist.map((value) => Number(value.toFixed(3)))
  };
});

const summary = {
  runs: RUNS,
  passThreshold: CHAPTER_PASS_STARS,
  chapters: chapterStats,
  campaignPassRate: Number(
    (
      results.filter((result) => result.passed === CHAPTERS.length).length /
      RUNS
    ).toFixed(3)
  ),
  averageFinalAbility: Number(
    (
      results.reduce((sum, result) => sum + result.finalAbility, 0) / RUNS
    ).toFixed(1)
  ),
  averagePlayCount: Number(
    (results.reduce((sum, result) => sum + result.playCount, 0) / RUNS).toFixed(
      1
    )
  )
};

console.log(JSON.stringify(summary, null, 2));
