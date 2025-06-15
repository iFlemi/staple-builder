import { describe, it } from "vitest"
import { assertThat, match, PrettyPrinter } from "mismatched"
import * as Colour from "@/domain/Colour"
import { FileData } from "@/domain/FileData"
import { fileDataToCardList } from "@/functions/cardNameListParser"
import { Option } from "prelude-ts"

describe("fileDataToCardList tests", () => {
  it("should convert file data with single colour to card list", () => {
    const fileData: FileData = {
      fileName: "U",
      fileContents: "High Tide\r\nCounterspell",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "High Tide",
        colourRequirement: [Colour.Blue],
        packageName: Option.none(),
      },
      {
        name: "Counterspell",
        colourRequirement: [Colour.Blue],
        packageName: Option.none(),
      },
    ])
  })

  it("should convert file data with multiple colours to card list", () => {
    const fileData: FileData = {
      fileName: "UR",
      fileContents: "Shao Jun\r\nTellah, Great Sage",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Shao Jun",
        colourRequirement: match.array.unordered([Colour.Red, Colour.Blue]),
        packageName: Option.none(),
      },
      {
        name: "Tellah, Great Sage",
        colourRequirement: match.array.unordered([Colour.Red, Colour.Blue]),
        packageName: Option.none(),
      },
    ])
  })

  it("should convert file data with colourless cards", () => {
    const fileData: FileData = {
      fileName: "C",
      fileContents: "Sol Ring\r\nMana Crypt",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Sol Ring",
        colourRequirement: [Colour.Colourless],
        packageName: Option.none(),
      },
      {
        name: "Mana Crypt",
        colourRequirement: [Colour.Colourless],
        packageName: Option.none(),
      },
    ])
  })

  it("should handle single card in file contents", () => {
    const fileData: FileData = {
      fileName: "R",
      fileContents: "Lightning Bolt",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Lightning Bolt",
        colourRequirement: [Colour.Red],
        packageName: Option.none(),
      },
    ])
  })

  it("should handle empty file contents", () => {
    const fileData: FileData = {
      fileName: "G",
      fileContents: "",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isLeft()).is(true)
    assertThat(
      result.getLeftOrElse(new Error("Should not get here")).message,
    ).is(match.string.includes("Empty"))
  })

  it("should handle file contents with only whitespace", () => {
    const fileData: FileData = {
      fileName: "U",
      fileContents: "   \r\n   \r\n   ",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isLeft()).is(true)
    assertThat(
      result.getLeftOrElse(new Error("Should not get here")).message,
    ).is(match.string.includes("Empty"))
  })

  it("should filter out empty lines from file contents", () => {
    const fileData: FileData = {
      fileName: "B",
      fileContents: "Dark Ritual\r\n\r\nDoom Blade\r\n",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Dark Ritual",
        colourRequirement: [Colour.Black],
        packageName: Option.none(),
      },
      {
        name: "Doom Blade",
        colourRequirement: [Colour.Black],
        packageName: Option.none(),
      },
    ])
  })

  it("should fail when invalid colour in filename", () => {
    const fileData: FileData = {
      fileName: "WXU",
      fileContents: "Lightning Bolt\r\nCounterspell",
    }

    const result = fileDataToCardList(fileData)
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
      fileContents: "Giant Growth\r\nLlanowar Elves\r\nBirds of Paradise",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Giant Growth",
        colourRequirement: [Colour.Green],
        packageName: Option.none(),
      },
      {
        name: "Llanowar Elves",
        colourRequirement: [Colour.Green],
        packageName: Option.none(),
      },
      {
        name: "Birds of Paradise",
        colourRequirement: [Colour.Green],
        packageName: Option.none(),
      },
    ])
  })

  it("should handle all five colours in filename", () => {
    const fileData: FileData = {
      fileName: "WUBRG",
      fileContents: "Child of Alara",
    }

    const result = fileDataToCardList(fileData)
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
        packageName: Option.none(),
      },
    ])
  })
})
