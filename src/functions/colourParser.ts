import { Arr, pipe } from "weland"
import { Result } from "@/utils/Result"
import { Colour, Colourless, colourMap } from "@/domain/Colour"
import { Either } from "prelude-ts"
import * as Array from "@/utils/Array"

export const stringToColourIdentity = (input: string) =>
  pipe(
    [...input],
    Array.distinct,
    Arr.map(parseChar),
    Result.sequence,
    Result.mapLeft(
      (l) => new Error(`failed to parse ${input} with error: ${l.message}`),
    ),
  )

const parseChar = (input: string): Result<Colour> =>
  input.length === 1 && input[0] in colourMap
    ? Result.of(colourMap[input[0]])
    : Either.left(new Error(`Unknown colour input: ${input}`))

export const toColourIdentity = (colours: Colour[]) =>
  Array.distinct(colours)
    .map((c) => c.character)
    .toSorted()
    .join("")

export const getColourCombinations = (colours: Colour[]) => {
  const chars = [...toColourIdentity(colours)]
  return [2, 3, 4, 5].flatMap((length) => generateCombinations(chars, length))
}

export const generateCombinations = (
  chars: string[],
  targetLength: number,
  startIndex: number = 0,
  currentCombination: string[] = [],
): string[] => {
  // Base case 1: We've built a complete combination
  if (currentCombination.length === targetLength)
    return [currentCombination.join("")]

  // Base case 2: Not enough characters left to complete
  const remainingChars = chars.length - startIndex
  const charsStillNeeded = targetLength - currentCombination.length
  if (remainingChars < charsStillNeeded) return []

  // Base case 3: We've slid past the end
  if (startIndex >= chars.length) return []

  const currentChar = chars[startIndex]

  // Choice 1: Include current character, slide window forward
  const withCurrent = generateCombinations(
    chars,
    targetLength,
    startIndex + 1,
    [...currentCombination, currentChar],
  )

  // Choice 2: Skip current character, slide window forward
  const withoutCurrent = generateCombinations(
    chars,
    targetLength,
    startIndex + 1,
    currentCombination,
  )

  // Combine results from both choices
  return [...withCurrent, ...withoutCurrent]
}
