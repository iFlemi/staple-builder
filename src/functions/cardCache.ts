import { Card } from "@/domain/Card"
import { Colour } from "@/domain/Colour"
import {
  getColourCombinations,
  toColourIdentity,
} from "@/functions/colourParser"
import { pipe } from "weland"
import * as String from "@/utils/String"

const cardCache: Map<string, Set<Card>> = new Map()

export const newCardCache = () => {
  const addCards = (colours: Colour[], cards: Card[]) => {
    const colourString = pipe(toColourIdentity(colours), String.sortChars)
    const existingSet = cardCache.get(colourString) || new Set()
    cardCache.set(colourString, existingSet.union(new Set(cards)))
  }

  const lookup = (colours: Colour[]) => {
    const colourIdentity = toColourIdentity(colours)
    const colourless = cardCache.get("C") || new Set()
    const monoColoured = [...colourIdentity].map(
      (c): Set<Card> => cardCache.get(c) || new Set(),
    )
    const multiColoured = getColourCombinations(colours).map(
      (combo): Set<Card> => cardCache.get(combo) || new Set(),
    )
    const all = [...multiColoured, ...monoColoured, colourless]
    return [...all.reduce((acc, set) => acc.union(set), new Set())]
  }

  return { lookup, addCards }
}
