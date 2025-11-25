import { computeGlobalAlignment, computeLocalAlignment, epitopeMap } from '@vsdbm/mapping-library'

export const process = (work) => {
  let result;
  if (work.type === 'local-mapping') result = computeLocalAlignment(work.sequence1, work.sequence2);
  if (work.type === 'global-mapping') result = computeGlobalAlignment(work.sequence1, work.sequence2, work.id2)
  if (work.type === 'epitope-mapping') result = epitopeMap(work.sequence1, work.sequence2);

  return {
    ...result,
    organism: work.organism,
    idSequence: work.id1,
    ...(work.type !== 'epitope-mapping' ? { idSubtype: work.id2 } : {})
  };
}

export default process;