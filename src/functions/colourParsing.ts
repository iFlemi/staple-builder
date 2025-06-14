import {Arr, pipe} from "weland";
import {Result} from "@/utils/Result";
import {Colour, Colourless, colourMap} from "@/domain/Colour";
import {Either} from "prelude-ts";

export const stringToColourIdentity = (input: string) =>
    input.length === 0
        ? Result.of([Colourless])
        : pipe(
        [...input],
        Arr.map(parseChar),
        Result.sequence,
        Result.mapLeft(l => new Error(`failed to parse ${input} with error: ${l.message}`))
    )

const parseChar = (input: string): Result<Colour> =>
    input.length === 1 && input[0] in colourMap
        ? Result.of(colourMap[input[0]])
        : Either.left(new Error(`Unknown colour input: ${input}`))