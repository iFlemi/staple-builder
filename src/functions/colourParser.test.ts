import { describe, it } from "vitest"
import { stringToColourIdentity } from "@/functions/colourParser"
import { assertThat, match } from "mismatched"
import * as Colour from "@/domain/Colour"

describe("colourParsing tests", () => {
  it("should parse a valid single colour", () => {
    const result = stringToColourIdentity("W")
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([Colour.White])
  })

  it("should parse colourless if no colour passed", () => {
    const result = stringToColourIdentity("")
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([Colour.Colourless])
  })

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
})
