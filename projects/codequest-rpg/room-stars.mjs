// Minimum action counts for the published room order, including required pickups and powers.
const targets=[2,4,6,11,12,11,12,9,12,13,20,14,6,5,8,10,13,11,11,10,7,9];

export function starTargets(index){
  const three=targets[index];
  return {three,two:three+Math.max(2,Math.ceil(three*.35))};
}

export function starsFor(index,steps){
  const {three,two}=starTargets(index);
  return steps<=three?3:steps<=two?2:1;
}

export function starsText(stars){
  return '★'.repeat(stars)+'☆'.repeat(3-stars);
}
