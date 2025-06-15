import { describe, it } from "vitest"
import { getDeckExport, toMTGAExport } from "@/functions/deckExport"
import { Option } from "prelude-ts"
import { Card } from "@/domain/Card"
import { assertThat, match, PrettyPrinter } from "mismatched"

describe("deckExport tests", () => {
  it("should generate historic brawl deck export without enough cards", () => {
    const result = getDeckExport(generateCards(1))
    assertThat(result.cardLines[0].name).is(match.string.nonEmpty())
    assertThat(result.cardLines[1].quantity).is(98)
    assertThat(result.commanderName).is(match.string.nonEmpty())
  })

  it("should generate generic deck export with too many cards", () => {
    const result = getDeckExport(generateCards(110))
    assertThat(result.cardLines.length).is(110)
    assertThat(result.commanderName).is(undefined)
  })

  it("should generate history brawl deck export with exactly enough cards", () => {
    const result = getDeckExport(generateCards(99))
    //PrettyPrinter.logToConsole(result)
    assertThat(result.cardLines.length).is(99)
    assertThat(result.commanderName).is(match.string.nonEmpty())
  })

  it.skip("should convert deckExport to export string", () => {
    //bad idea to not use test data generator instead of calling internal logic, but this is not a real test just an exploratory one
    const deckExport = getDeckExport(generateCards(99))
    const result = toMTGAExport(deckExport)
    PrettyPrinter.logToConsole(result)
  })

  const generateCards = (quantity: number) => {
    return [...Array(quantity)].fill("Wastes")
  }
})
