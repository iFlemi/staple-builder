import { describe, it } from "vitest"
import {
  getColourCombinations,
  stringToColourIdentity,
  toColourIdentity,
} from "@/functions/colourParser"
import { assertThat, match } from "mismatched"
import * as Colour from "@/domain/Colour"
import { sortChars } from "@/utils/String"

describe("colourParsing tests", () => {
  it("should parse a valid single colour", () => {
    const result = stringToColourIdentity("W")
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([Colour.White])
  })

  // it("should parse colourless if no colour passed", () => {
  //   const result = stringToColourIdentity("")
  //   assertThat(result.isRight()).is(true)
  //   assertThat(result.getOrThrow()).is([Colour.Colourless])
  // })

  it("should parse valid colours", () => {
    const result = stringToColourIdentity("WUBGR")
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is(
      match.array.unordered([
        Colour.White,
        Colour.Blue,
        Colour.Black,
        Colour.Green,
        Colour.Red,
      ]),
    )
  })

  it("should parse valid colours out of order", () => {
    const result = stringToColourIdentity("BUGRW")
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is(
      match.array.unordered([
        Colour.White,
        Colour.Blue,
        Colour.Black,
        Colour.Green,
        Colour.Red,
      ]),
    )
  })

  it("should fail with message when invalid input passed", () => {
    const result = stringToColourIdentity("UBX")
    assertThat(result.isLeft()).is(true)
    assertThat(
      result.getLeftOrElse(new Error("Should not get here")).message,
    ).is(
      match.allOf([
        match.string.includes("Unknown"),
        match.string.includes("UBX"),
        match.string.endsWith("X"),
      ]),
    )
  })

  it("should convert single colour to identity string", () => {
    const colours = [Colour.White]
    const result = toColourIdentity(colours)
    assertThat(result).is("W")
  })

  it("should convert multiple colours to identity string", () => {
    const colours = [Colour.White, Colour.Blue, Colour.Black]
    const result = toColourIdentity(colours)
    assertThat(result).is(sortChars("WUB"))
  })

  it("should convert all five colours to identity string", () => {
    const colours = [
      Colour.White,
      Colour.Blue,
      Colour.Black,
      Colour.Red,
      Colour.Green,
    ]
    const result = toColourIdentity(colours)
    assertThat(result).is(sortChars("WUBRG"))
  })

  it("should handle single colour variations", () => {
    assertThat(toColourIdentity([Colour.Blue])).is("U")
    assertThat(toColourIdentity([Colour.Black])).is("B")
    assertThat(toColourIdentity([Colour.Red])).is("R")
    assertThat(toColourIdentity([Colour.Green])).is("G")
  })

  it("should handle empty colour array", () => {
    const colours: Colour.Colour[] = []
    const result = toColourIdentity(colours)
    assertThat(result).is("")
  })

  it("should handle colourless colour", () => {
    const colours = [Colour.Colourless]
    const result = toColourIdentity(colours)
    assertThat(result).is("C")
  })

  it("should handle mixed colours with duplicates", () => {
    const colours = [Colour.White, Colour.Blue, Colour.White, Colour.Red]
    const result = toColourIdentity(colours)
    assertThat(result).is(sortChars("WUR"))
  })

  it("should be reversible with stringToColourIdentity for valid colours", () => {
    const originalString = "WUBRG"
    const parseResult = stringToColourIdentity(originalString)
    assertThat(parseResult.isRight()).is(true)

    const colours = parseResult.getOrThrow()
    const identityString = toColourIdentity(colours)

    // Note: This may not be exactly equal due to ordering, but should contain same characters
    assertThat(identityString.length).is(5)
    assertThat(identityString).is(
      match.allOf([
        match.string.includes("W"),
        match.string.includes("U"),
        match.string.includes("B"),
        match.string.includes("R"),
        match.string.includes("G"),
      ]),
    )
  })

  describe("getColourCombinations tests", () => {
    it("should generate 2-character combinations from 3 colours", () => {
      const colours = [Colour.White, Colour.Blue, Colour.Black]
      const result = getColourCombinations(colours)

      assertThat(result).is(match.array.unordered(["BU", "BW", "UW", "BUW"]))
    })

    it("should generate all combinations from 2 colours", () => {
      const colours = [Colour.Red, Colour.Green]
      const result = getColourCombinations(colours)

      assertThat(result).is(["GR"])
    })

    it("should generate all combinations from all 5 colours", () => {
      const colours = [
        Colour.White,
        Colour.Blue,
        Colour.Black,
        Colour.Red,
        Colour.Green,
      ]
      const result = getColourCombinations(colours)

      const twoColour = result.filter((combo) => combo.length === 2)
      const threeColour = result.filter((combo) => combo.length === 3)
      const fourColour = result.filter((combo) => combo.length === 4)
      const fiveColour = result.filter((combo) => combo.length === 5)

      assertThat(twoColour.length).is(10) // C(5,2) = 10
      assertThat(threeColour.length).is(10) // C(5,3) = 10
      assertThat(fourColour.length).is(5) // C(5,4) = 5
      assertThat(fiveColour.length).is(1) // C(5,5) = 1

      assertThat(fiveColour).is(["BGRUW"])
    })

    it("should return empty array for single colour", () => {
      const colours = [Colour.Red]
      const result = getColourCombinations(colours)

      // No combinations of length 2+ possible with only 1 colour
      assertThat(result).is([])
    })

    it("should return empty array for colourless", () => {
      const colours = [Colour.Colourless]
      const result = getColourCombinations(colours)

      assertThat(result).is([])
    })

    it("should handle duplicate colours by treating them as single identity", () => {
      const colours = [Colour.White, Colour.White, Colour.Blue]
      const result = getColourCombinations(colours)
      assertThat(result).is(["UW"])
    })

    it("should maintain sorted order in combinations", () => {
      const colours = [Colour.Red, Colour.White, Colour.Blue]
      const result = getColourCombinations(colours)
      assertThat(result).is(match.array.unordered(["RU", "UW", "RW", "RUW"]))
    })

    it("should generate expected 2-char combinations for specific colours", () => {
      const colours = [Colour.Blue, Colour.Red, Colour.Green, Colour.White]
      const result = getColourCombinations(colours)

      const length2 = result.filter((combo) => combo.length === 2)

      assertThat(length2).is(
        match.array.unordered(["GU", "RU", "UW", "GR", "GW", "RW"]),
      )
    })

    it("should include specific 3-char combination", () => {
      const colours = [Colour.White, Colour.Blue, Colour.Black, Colour.Red]
      const result = getColourCombinations(colours)

      const length3 = result.filter((combo) => combo.length === 3)

      assertThat(length3).is(match.array.contains("BRW"))
      assertThat(length3).is(match.array.contains("BUW"))
    })
  })
})
