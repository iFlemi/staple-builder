export type DeckExport = {
  commanderName?: string
  deckName: string
  cardLines: CardExport[]
}

export type CardExport = {
  name: string
  quantity: number
}
