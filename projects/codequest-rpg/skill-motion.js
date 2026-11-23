// Time is measured in seconds. Poses blend between authored keyframes;
// impact events and the teaching timeline use the same clock.
export const motion = {
  // [time, forward, jump, lateral, turn, lean, right shoulder, left shoulder]
  combo: {
    phases: [0, .55, 1.16, 1.8, 2.48], hits: [.77, 1.42, 2.23],
    poses: [[.45,.1,0,0,-.5,-.18,-1.8,-.6],[.77,1.2,0,0,.65,.2,.65,-1.1],[1.13,.85,0,0,.45,-.1,-1.6,-.9],[1.42,1.7,0,0,-.7,.22,.65,-.4],[1.83,1.35,0,0,-.15,-.25,-2.6,-1],[2.08,2,.46,0,0,-.12,-2.7,-1.35],[2.23,2.5,0,0,0,.45,.86,.36]],
  },
  spin: {
    phases: [0,.5,1.34,2.12,2.56], hits: [2.12],
    poses: [[.48,.15,0,0,-.65,.2,-1,-.8],[1.34,1.4,.14,.18,Math.PI,.16,-1.3,-1.1],[2.12,2.3,0,0,Math.PI*2,.18,-1.6,-1.2],[2.55,2.1,0,0,Math.PI*2,.25,-.6,-.3]],
  },
  ground: {
    phases: [0,.66,1.63,1.79,2.35], hits: [1.79],
    poses: [[.65,.1,0,0,0,.3,-2.5,-1.5],[1.25,1.65,.92,0,0,-.18,-2.85,-2.2],[1.63,2.08,.48,0,0,.08,-1.5,-1.25],[1.79,2.35,0,0,0,.56,1,.45],[2.22,2.27,0,0,0,.38,.45,.25]],
  },
  fireball: {
    phases: [0,.48,1.48,2.38,2.83], launches: [1.48], hits: [2.38],
    poses: [[.48,.05,0,0,-.22,-.1,-1.15,-.9],[1.31,.05,0,0,-.36,-.28,-1.9,-1.28],[1.48,.52,0,0,.12,.25,-1.48,-.5],[1.92,.44,0,0,0,.09,-1.17,-.35]],
  },
  frost: {
    phases: [0,.47,1.21,1.75,2.45], hits: [1.21],
    poses: [[.47,0,0,0,0,.27,-.78,-.78],[1.12,0,.12,0,0,-.24,-1.95,-1.95],[1.32,0,0,0,0,.31,-1.17,-1.17],[1.85,0,0,0,0,.08,-.65,-.65]],
  },
  meteor: {
    phases: [0,1.01,1.69,2.37,3.03], launches: [1.01,1.69,2.37], hits: [1.59,2.27,2.95],
    poses: [[.77,0,.12,0,-.2,-.24,-2.45,-1.65],[1.15,.12,.1,0,.12,.07,-1.12,-1.65],[1.55,0,.12,0,-.2,-.24,-2.45,-1.65],[1.84,.12,.1,0,.12,.07,-1.12,-1.65],[2.23,0,.12,0,-.2,-.24,-2.45,-1.65],[2.53,.12,.1,0,.12,.07,-1.12,-1.65],[3.07,0,0,0,0,0,-.65,-.45]],
  },
  dashstrike: {
    phases: [0,.55,1.11,1.48,2.49], hits: [1.21],
    poses: [[.54,-.2,0,0,-.22,.44,-.65,.5],[.88,2.95,.08,-.76,.1,.52,.6,-1],[1.11,5.9,0,-.53,2.9,.22,-1.65,-.65],[1.21,5.9,0,-.1,Math.PI,.32,.78,-.55],[1.48,5.65,0,-.55,Math.PI,.13,.2,-.35],[2.49,.34,0,-.62,Math.PI*2,.17,-.65,-.3]],
  },
  arrows: {
    phases: [0,.9,1.6,2.3,2.93], launches: [.9,1.6,2.3], hits: [1.36,2.06,2.76],
    poses: [[.78,0,0,0,-.19,-.13,-1.55,-2.12],[.94,.13,0,0,.1,.09,-1.55,-.75],[1.48,0,0,0,-.19,-.13,-1.55,-2.12],[1.64,.13,0,0,.1,.09,-1.55,-.75],[2.18,0,0,0,-.19,-.13,-1.55,-2.12],[2.34,.13,0,0,.1,.09,-1.55,-.75]],
  },
  afterimage: {
    phases: [0,.47,1.09,1.78,2.53], hits: [2.11],
    poses: [[.46,-.15,0,0,0,.39,-.4,.5],[.72,.72,.1,-1.55,-.55,.42,.5,-1.28],[1.08,.93,0,-1.52,.37,.21,-.52,.35],[1.4,1.7,.16,1.48,.62,.45,-1.15,.5],[1.77,1.88,0,1.4,-.45,.18,-.65,.3],[2.11,2.92,.08,0,0,.45,.7,-.8],[2.53,2.6,0,.13,0,.12,.1,-.35]],
  },
  dash: {
    phases: [0,.49,.87,1.32],
    poses: [[.48,-.18,0,0,0,.45,-.7,.55],[.73,1.64,.07,0,0,.51,.55,-1],[.97,2.32,0,0,0,.26,-.53,-.22],[1.32,2.22,0,0,0,.05,-.12,-.1]],
    end: [2.22,0,0,0,0,0,0],
  },
  barrier: {
    phases: [0,.53,1.4,2.19], hits: [1.4],
    poses: [[.53,0,0,0,0,.23,-1.12,-1.12],[1.21,0,0,0,0,-.17,-1.7,-1.7],[1.54,0,0,0,0,.18,-.9,-.9],[2.15,0,0,0,0,0,-.6,-.6]],
  },
};

const curves = new WeakMap();

function buildCurve(track, duration) {
  const frames = [[0,0,0,0,0,0,0,0], ...track.poses];
  const anchor = frames.at(-1);
  const restingTurn = Math.round(anchor[4] / (2 * Math.PI)) * 2 * Math.PI;
  const end = track.end ?? [anchor[1],0,anchor[3],restingTurn,0,0,0];
  frames.push([duration,...end]);
  const slopes = frames.map((frame,index) => {
    if(index === 0 || index === frames.length - 1) return end.map(() => 0);
    const before = frames[index - 1], after = frames[index + 1];
    return frame.slice(1).map((value,axis) => {
      const incoming = (value - before[axis + 1]) / (frame[0] - before[0]);
      const outgoing = (after[axis + 1] - value) / (after[0] - frame[0]);
      return incoming * outgoing > 0 ? 2 / (1 / incoming + 1 / outgoing) : 0;
    });
  });
  return {frames,slopes,duration};
}

export function samplePose(track, time, duration) {
  let curve = curves.get(track);
  if(curve?.duration !== duration) {
    curve = buildCurve(track,duration);
    curves.set(track,curve);
  }
  const {frames,slopes} = curve;
  const t = Math.max(0,Math.min(duration,time));
  const index = frames.findIndex((frame,i) => i > 0 && frame[0] >= t);
  const a = frames[index - 1], b = frames[index];
  const span = b[0] - a[0], u = (t - a[0]) / span;
  const u2 = u * u, u3 = u2 * u;
  // Cubic Hermite interpolation carries velocity through neighboring poses
  // and eases to zero at changes of direction.
  return a.slice(1).map((value,axis) =>
    (2*u3 - 3*u2 + 1) * value + (u3 - 2*u2 + u) * span * slopes[index - 1][axis]
    + (-2*u3 + 3*u2) * b[axis + 1] + (u3 - u2) * span * slopes[index][axis]
  );
}
