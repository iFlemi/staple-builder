import { describe, it } from "vitest"
import { assertThat, match, PrettyPrinter } from "mismatched"
import * as Colour from "@/domain/Colour"
import { FileData } from "@/domain/FileData"
import { fileDataToCardList } from "@/functions/cardNameListParser"

describe("fileDataToCardList tests", () => {
  it("should convert file data with single colour to card list", () => {
    const fileData: FileData = {
      fileName: "U",
      fileCategory: "uncommon",
      fileContents: "High Tide\r\nCounterspell",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "High Tide",
        rarity: "uncommon",
        colourRequirement: [Colour.Blue],
      },
      {
        name: "Counterspell",
        rarity: "uncommon",
        colourRequirement: [Colour.Blue],
      },
    ])
  })

  it("should convert file data with multiple colours to card list", () => {
    const fileData: FileData = {
      fileName: "UR",
      fileCategory: "rare",
      fileContents: "Shao Jun\r\nTellah, Great Sage",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Shao Jun",
        rarity: "rare",
        colourRequirement: match.array.unordered([Colour.Red, Colour.Blue]),
      },
      {
        name: "Tellah, Great Sage",
        rarity: "rare",
        colourRequirement: match.array.unordered([Colour.Red, Colour.Blue]),
      },
    ])
  })

  it("should convert file data with colourless cards", () => {
    const fileData: FileData = {
      fileName: "",
      fileCategory: "uncommon",
      fileContents: "Sol Ring\r\nMana Crypt",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Sol Ring",
        rarity: "uncommon",
        colourRequirement: [Colour.Colourless],
      },
      {
        name: "Mana Crypt",
        rarity: "uncommon",
        colourRequirement: [Colour.Colourless],
      },
    ])
  })

  it("should handle single card in file contents", () => {
    const fileData: FileData = {
      fileName: "R",
      fileCategory: "rare",
      fileContents: "Lightning Bolt",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Lightning Bolt",
        rarity: "rare",
        colourRequirement: [Colour.Red],
      },
    ])
  })

  it("should handle empty file contents", () => {
    const fileData: FileData = {
      fileName: "G",
      fileCategory: "uncommon",
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
      fileCategory: "rare",
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
      fileCategory: "uncommon",
      fileContents: "Dark Ritual\r\n\r\nDoom Blade\r\n",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Dark Ritual",
        rarity: "uncommon",
        colourRequirement: [Colour.Black],
      },
      {
        name: "Doom Blade",
        rarity: "uncommon",
        colourRequirement: [Colour.Black],
      },
    ])
  })

  it("should fail when package file category is provided", () => {
    const fileData: FileData = {
      fileName: "W",
      fileCategory: "package",
      fileContents: "Lightning Bolt\r\nCounterspell",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isLeft()).is(true)
    assertThat(
      result.getLeftOrElse(new Error("Should not get here")).message,
    ).is("Cannot add package to card list")
  })

  it("should fail when invalid colour in filename", () => {
    const fileData: FileData = {
      fileName: "WXU",
      fileCategory: "rare",
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
      fileCategory: "uncommon",
      fileContents: "Giant Growth\r\nLlanowar Elves\r\nBirds of Paradise",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Giant Growth",
        rarity: "uncommon",
        colourRequirement: [Colour.Green],
      },
      {
        name: "Llanowar Elves",
        rarity: "uncommon",
        colourRequirement: [Colour.Green],
      },
      {
        name: "Birds of Paradise",
        rarity: "uncommon",
        colourRequirement: [Colour.Green],
      },
    ])
  })

  it("should handle all five colours in filename", () => {
    const fileData: FileData = {
      fileName: "WUBRG",
      fileCategory: "rare",
      fileContents: "Child of Alara",
    }

    const result = fileDataToCardList(fileData)
    assertThat(result.isRight()).is(true)
    assertThat(result.getOrThrow()).is([
      {
        name: "Child of Alara",
        rarity: "rare",
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
