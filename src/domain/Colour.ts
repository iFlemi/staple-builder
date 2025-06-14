export type ColourCharacter = 'W' | 'U' | 'B' | 'R' | 'G'

export type Colour = {
    character: ColourCharacter
    name: string
    symbol: string
} | { name: "Colourless", symbol: string }

export const White: Colour = { character: 'W', name: 'White', symbol: 'W' }
export const Blue: Colour = { character: 'U', name: 'Blue', symbol: 'U' }
export const Black: Colour = { character: 'B', name: 'Black', symbol: 'B' }
export const Red: Colour = { character: 'R', name: 'Red', symbol: 'R' }
export const Green: Colour = { character: 'G', name: 'Green', symbol: 'G' }
export const Colourless: Colour = { name: 'Colourless', symbol: 'C'}

export const colourMap: Record<string, Colour> = {
    'W': White,
    'U': Blue,
    'B': Black,
    'R': Red,
    'G': Green
}