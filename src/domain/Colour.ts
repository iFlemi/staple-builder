//characterRepresentation: 'W' | 'U' | 'B' | 'R' | 'G',
export type Colour = White | Blue | Black | Red | Green

export type White = {
    character: 'W'
    symbol: string,
    name: 'White'
}

export type Blue = {
    character: 'U'
    symbol: string,
    name: 'Blue'
}

export type Black = {
    character: 'B'
    symbol: string,
    name: 'Black'
}

export type Red = {
    character: 'R'
    symbol: string,
    name: 'Red'
}

export type Green = {
    character: 'G'
    symbol: string,
    name: 'Green'
}

export type Colourless = {
    character: 'C'
    symbol: string,
    name: 'Colourless'
}


