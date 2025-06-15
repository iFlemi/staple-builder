import { describe, it } from "vitest"
import { assertThat, match, PrettyPrinter } from "mismatched"
import * as Colour from "@/domain/Colour"
import { FileData } from "@/domain/FileData"
import { Option } from "prelude-ts"
import { loadFileDataIntoCache } from "@/functions/cachePopulator"
import { newCardCache } from "@/functions/cardCache"

describe("fileDataToCardList tests", () => {
  const cache = newCardCache()

  it("should convert file data with single colour to card list", () => {
    const fileData: FileData = {
      fileName: "U",
      fileContents: "High Tide\nCounterspell",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "High Tide",
        colourRequirement: [Colour.Blue],
      },
      {
        name: "Counterspell",
        colourRequirement: [Colour.Blue],
      },
    ])
  })

  it("should convert file data with multiple colours to card list", () => {
    const fileData: FileData = {
      fileName: "UR",
      fileContents: "Shao Jun\nTellah, Great Sage",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Shao Jun",
        colourRequirement: match.array.unordered([Colour.Red, Colour.Blue]),
      },
      {
        name: "Tellah, Great Sage",
        colourRequirement: match.array.unordered([Colour.Red, Colour.Blue]),
      },
    ])
  })

  it("should convert file data with colourless cards", () => {
    const fileData: FileData = {
      fileName: "C",
      fileContents: "Sol Ring\nMana Crypt",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Sol Ring",
        colourRequirement: [Colour.Colourless],
      },
      {
        name: "Mana Crypt",
        colourRequirement: [Colour.Colourless],
      },
    ])
  })

  it("should handle single card in file contents", () => {
    const fileData: FileData = {
      fileName: "R",
      fileContents: "Lightning Bolt",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Lightning Bolt",
        colourRequirement: [Colour.Red],
      },
    ])
  })

  it("should handle empty file contents", () => {
    const fileData: FileData = {
      fileName: "G",
      fileContents: "",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isLeft()).is(true)
    assertThat(
      result.getLeftOrElse(new Error("Should not get here")).message,
    ).is(match.string.includes("Empty"))
  })

  it("should handle file contents with only whitespace", () => {
    const fileData: FileData = {
      fileName: "U",
      fileContents: "   \n   \n   ",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isLeft()).is(true)
    assertThat(
      result.getLeftOrElse(new Error("Should not get here")).message,
    ).is(match.string.includes("Empty"))
  })

  it("should filter out empty lines from file contents", () => {
    const fileData: FileData = {
      fileName: "B",
      fileContents: "Dark Ritual\n\nDoom Blade\n",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Dark Ritual",
        colourRequirement: [Colour.Black],
      },
      {
        name: "Doom Blade",
        colourRequirement: [Colour.Black],
      },
    ])
  })

  it("should fail when invalid colour in filename", () => {
    const fileData: FileData = {
      fileName: "WXU",
      fileContents: "Lightning Bolt\nCounterspell",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isLeft()).is(true)
    assertThat(
      result.getLeftOrElse(new Error("Should not get here")).message,
    ).is(
      match.allOf([
        match.string.includes("failed to parse"),
        match.string.includes("WXU"),
        match.string.includes("Unknown colour input"),
        match.string.includes("X"),
      ]),
    )
  })

  it("should preserve card name exactly as written", () => {
    const fileData: FileData = {
      fileName: "G",
      fileContents: "Giant Growth\nLlanowar Elves\nBirds of Paradise",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Giant Growth",
        colourRequirement: [Colour.Green],
      },
      {
        name: "Llanowar Elves",
        colourRequirement: [Colour.Green],
      },
      {
        name: "Birds of Paradise",
        colourRequirement: [Colour.Green],
      },
    ])
  })

  it("should handle all five colours in filename", () => {
    const fileData: FileData = {
      fileName: "WUBRG",
      fileContents: "Child of Alara",
    }

    const result = loadFileDataIntoCache(fileData, cache)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Child of Alara",
        colourRequirement: match.array.unordered([
          Colour.White,
          Colour.Blue,
          Colour.Black,
          Colour.Red,
          Colour.Green,
        ]),
      },
    ])
  })
})
