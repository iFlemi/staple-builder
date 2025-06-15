import { Colour, Colourless } from "@/domain/Colour"
import {
  getColourCombinations,
  toColourIdentity,
} from "@/functions/colourParser"
import { pipe } from "weland"
import * as String from "@/utils/String"
import { PrettyPrinter } from "mismatched"

export type CardCache = ReturnType<typeof newCardCache>

const cardCache: Map<string, Set<string>> = new Map()

export const newCardCache = () => {
  const addCards = (colours: Colour[], cardNames: string[]) => {
    const colourString = pipe(toColourIdentity(colours), String.sortChars)
    const existingSet = cardCache.get(colourString) || new Set()
    const newSet = existingSet.union(new Set(cardNames))
    cardCache.set(colourString, newSet)
    //console.log(`Loaded cards into cache for colour identity ${colourString}`)
  }

  const lookup = (colours: Colour[]) => {
    const colourIdentity = toColourIdentity(colours)
    const colourless = colours.includes(Colourless)
      ? cardCache.get("C") || new Set<string>()
      : new Set<string>()
    const monoColoured = [...colourIdentity].map(
      (c): Set<string> => cardCache.get(c) || new Set<string>(),
    )
    const multiColoured = getColourCombinations(colours).map(
      (combo): Set<string> => cardCache.get(combo) || new Set<string>(),
    )
    const all = [...multiColoured, ...monoColoured, colourless]
    return all.reduce((acc, set) => acc.union(set), new Set<string>())
  }

  const showCache = () => {
    PrettyPrinter.logToConsole(cardCache)
  }

  const getEntries = (): [string, string[]][] => {
    return Array.from(cardCache.entries()).map(([key, set]) => [
      key,
      Array.from(set),
    ])
  }

  const fromEntries = (entries: [string, string[]][]) => {
    entries.forEach(([key, values]) => {
      cardCache.set(key, new Set(values))
    })
  }

  return { lookup, addCards, showCache, getEntries, fromEntries }
}
