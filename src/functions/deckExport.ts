import { DeckExport } from "@/domain/DeckExport"
import { ofType } from "mismatched"
import { Result } from "@/utils/Result"
import { Either } from "prelude-ts"

export const getDeckExport = (
  cardNames: string[],
  commanderName: string = "Progenitus",
  deckName: string = "Brawl Stapler Import",
): Result<DeckExport> => {
  const exportCards = cardNames.map((cn) => ({ name: cn, quantity: 1 }))

  //deck exports as friendly brawl if the card count is less than 100 (including commander)
  if (exportCards.length < 99) {
    return Result.of({
      cardLines: [
        ...exportCards,
        { name: "Wastes", quantity: 99 - exportCards.length },
      ],
      commanderName,
      deckName,
    })
  }

  if (exportCards.length > 250) {
    return Either.left(
      new Error(
        `Deck contains ${exportCards.length} cards, arena will not allow an import over 250.`,
      ),
    )
  }

  //import error if commander and deck is more than 100
  if (exportCards.length > 99) {
    return Result.of({
      cardLines: exportCards,
      deckName,
    })
  }

  return Result.of({
    cardLines: exportCards,
    commanderName,
    deckName,
  })
}

export const toMTGAExport = (deckExport: DeckExport) =>
  `About\r\nName ${deckExport.deckName}\r\n\r\n${
    ofType.isDefined(deckExport.commanderName)
      ? `Commander\r\n1 ${deckExport.commanderName}\r\n\r\n`
      : ""
  }Deck\r\n${deckExport.cardLines.map((c) => `${c.quantity} ${c.name}\r\n`).join("")}`
