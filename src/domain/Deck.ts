import {CardExport} from "@/domain/CardExport";

export type Deck = {
    about: string,
    commander: CardExport
    deck: CardExport[]
}

/*
About
Name Limit Break - Beat Rush

Commander
1 Tifa Lockhart

Deck
1 A-Haywire Mite
1 Adventuring Gear
...
*/