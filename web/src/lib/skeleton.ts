/** Confusable skeleton: NFKC + casefold + common Cyrillic/Greek look-alikes → Latin. */
const LOOKALIKES: Record<string, string> = {
  а: "a",
  е: "e",
  о: "o",
  р: "p",
  с: "c",
  х: "x",
  у: "y",
  і: "i",
  ѕ: "s",
  ԁ: "d",
  ɡ: "g",
  ӏ: "l",
  һ: "h",
  ј: "j",
  ҝ: "k",
  ԛ: "q",
  ԝ: "w",
  Α: "a",
  α: "a",
  Β: "b",
  β: "b",
  Ε: "e",
  ε: "e",
  Ζ: "z",
  Η: "h",
  Ι: "i",
  ι: "i",
  Κ: "k",
  κ: "k",
  Μ: "m",
  Ν: "n",
  ν: "v",
  Ο: "o",
  ο: "o",
  Ρ: "p",
  ρ: "p",
  Τ: "t",
  Υ: "y",
  υ: "y",
  Χ: "x",
  χ: "x",
  А: "a",
  В: "b",
  Е: "e",
  К: "k",
  М: "m",
  Н: "h",
  О: "o",
  Р: "p",
  С: "c",
  Т: "t",
  У: "y",
  Х: "x",
  Ѕ: "s",
  І: "i",
  Ј: "j",
};

export function skeleton(input: string): string {
  const nfkc = input.normalize("NFKC");
  let out = "";
  for (const ch of nfkc) {
    const mapped = LOOKALIKES[ch] ?? ch;
    out += mapped;
  }
  return out.toLocaleLowerCase();
}
