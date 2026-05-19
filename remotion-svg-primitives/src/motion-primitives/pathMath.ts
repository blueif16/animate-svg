export type Point = {
  x: number;
  y: number;
};

export type QuadraticPath = {
  type: "quadratic";
  from: Point;
  control: Point;
  to: Point;
};

export type CubicPath = {
  type: "cubic";
  from: Point;
  control1: Point;
  control2: Point;
  to: Point;
};

export type PathSegment = QuadraticPath | CubicPath;
export type FollowPathSpec = PathSegment | PathSegment[];

type Sample = {
  point: Point;
  tangent: Point;
  length: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const mixPoint = (from: Point, to: Point, progress: number): Point => ({
  x: mix(from.x, to.x, progress),
  y: mix(from.y, to.y, progress),
});

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const quadraticPoint = (path: QuadraticPath, t: number): Point => {
  const inv = 1 - t;

  return {
    x:
      inv * inv * path.from.x +
      2 * inv * t * path.control.x +
      t * t * path.to.x,
    y:
      inv * inv * path.from.y +
      2 * inv * t * path.control.y +
      t * t * path.to.y,
  };
};

const quadraticTangent = (path: QuadraticPath, t: number): Point => ({
  x:
    2 * (1 - t) * (path.control.x - path.from.x) +
    2 * t * (path.to.x - path.control.x),
  y:
    2 * (1 - t) * (path.control.y - path.from.y) +
    2 * t * (path.to.y - path.control.y),
});

const cubicPoint = (path: CubicPath, t: number): Point => {
  const inv = 1 - t;

  return {
    x:
      inv * inv * inv * path.from.x +
      3 * inv * inv * t * path.control1.x +
      3 * inv * t * t * path.control2.x +
      t * t * t * path.to.x,
    y:
      inv * inv * inv * path.from.y +
      3 * inv * inv * t * path.control1.y +
      3 * inv * t * t * path.control2.y +
      t * t * t * path.to.y,
  };
};

const cubicTangent = (path: CubicPath, t: number): Point => {
  const inv = 1 - t;

  return {
    x:
      3 * inv * inv * (path.control1.x - path.from.x) +
      6 * inv * t * (path.control2.x - path.control1.x) +
      3 * t * t * (path.to.x - path.control2.x),
    y:
      3 * inv * inv * (path.control1.y - path.from.y) +
      6 * inv * t * (path.control2.y - path.control1.y) +
      3 * t * t * (path.to.y - path.control2.y),
  };
};

const pointAt = (path: PathSegment, t: number) =>
  path.type === "quadratic" ? quadraticPoint(path, t) : cubicPoint(path, t);

const tangentAt = (path: PathSegment, t: number) =>
  path.type === "quadratic" ? quadraticTangent(path, t) : cubicTangent(path, t);

const sampleSegment = (path: PathSegment, steps: number): Sample[] => {
  const samples: Sample[] = [];
  let previous = pointAt(path, 0);
  let length = 0;

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const point = pointAt(path, t);

    if (index > 0) {
      length += distance(previous, point);
    }

    samples.push({
      point,
      tangent: tangentAt(path, t),
      length,
    });
    previous = point;
  }

  return samples;
};

const buildSamples = (
  path: FollowPathSpec,
  stepsPerSegment: number,
): Sample[] => {
  const segments = Array.isArray(path) ? path : [path];
  const samples: Sample[] = [];
  let totalLength = 0;
  let previous: Point | null = null;

  segments.forEach((segment, segmentIndex) => {
    const segmentSamples = sampleSegment(segment, stepsPerSegment);

    segmentSamples.forEach((sample, sampleIndex) => {
      if (segmentIndex > 0 && sampleIndex === 0) {
        return;
      }

      const point = sample.point;
      if (previous) {
        totalLength += distance(previous, point);
      }

      samples.push({
        point,
        tangent: sample.tangent,
        length: totalLength,
      });
      previous = point;
    });
  });

  return samples;
};

export const getSampledPoint = (
  path: FollowPathSpec,
  progress: number,
  stepsPerSegment = 96,
) => {
  const samples = buildSamples(path, stepsPerSegment);

  if (samples.length === 0) {
    return { point: { x: 0, y: 0 }, angle: 0 };
  }

  const target = samples[samples.length - 1].length * clamp01(progress);
  const nextIndex = samples.findIndex((sample) => sample.length >= target);

  if (nextIndex <= 0) {
    const first = samples[0];
    return {
      point: first.point,
      angle: (Math.atan2(first.tangent.y, first.tangent.x) * 180) / Math.PI,
    };
  }

  const next = samples[nextIndex];
  const previous = samples[nextIndex - 1];
  const span = next.length - previous.length;
  const segmentProgress = span === 0 ? 0 : (target - previous.length) / span;
  const point = mixPoint(previous.point, next.point, segmentProgress);
  const tangent = {
    x: next.point.x - previous.point.x || next.tangent.x,
    y: next.point.y - previous.point.y || next.tangent.y,
  };

  return {
    point,
    angle: (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI,
  };
};
