
export type CrocSurplusFlags = boolean | [boolean, boolean]

export function encodeSurplusArg (flags: CrocSurplusFlags, 
  isPairInverted: boolean = false): number {
  return typeof(flags) === "boolean" ?
    encodeSurplusToggle(flags) : encodeSurplusPair(flags, isPairInverted)
}

function encodeSurplusToggle (flag: boolean): number {
  return flag ? 0x3 : 0x0;
}

function encodeSurplusPair (flags: [boolean, boolean], 
  isPairInverted: boolean = false): number {
  const [leftFlag, rightFlag] = flags
  const [baseFlag, quoteFlag] = isPairInverted ?
    [rightFlag, leftFlag] : [leftFlag, rightFlag]
  return (baseFlag ? 0x1 : 0x0) + (quoteFlag ? 0x2 : 0x0)
}

export function decodeSurplusFlag (flag: number): [boolean, boolean] {
  return [((flag & 0x1) > 0), ((flag & 0x2) > 0)]
}