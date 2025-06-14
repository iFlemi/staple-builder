import {Either, Left} from "prelude-ts";
import {Applicative, Arr, identity, Monad, Sg, Traversable} from "weland";
import {dual} from "weland/dist/src/functions";
import {HKT} from "weland/dist/src/typeclass/hkt";
import {ArrayM} from "weland/dist/src/Array/instance";

export type Result<T, E = Error> = Either<E, T>

export interface ResultF<E = unknown> extends HKT {
    readonly E: E
    readonly type: Either<this['E'], this['A']>
}

export const ResultM: Monad<ResultF> & Traversable<ResultF> = {
    flatMap: dual(2, <A, B>(self: Result<A>, f: (a: A) => Result<B>) => self.flatMap(f)),
    of: Either.right,
    //@ts-ignore
    apply: dual(2, (self, fab) => fab.flatMap((f) => self.map(f))),
    map: dual(2, <A, B>(self: Result<A>, f: (a: A) => B) => self.map(f)),
    sequence: (G) => (self) => (self.isLeft() ? G.of(self as any) : G.map(self.get(), (_) => Either.right(_))),
    traverse: (G) => dual(2, (self, f) => (self.isLeft() ? G.of(self) : G.map(f(self.get()), (_) => Either.right(_)))),
    fold: dual(3, (self, init, f) => (self.isLeft() ? self : f(init, self.get()))),
}

export module Result {
    export const map = ResultM.map

    export const widen = <L, R, R2>(left: Left<L, R>): Left<L, R2> => left as any as Left<L, R2>

    //get an instance that lets us combine the error side of the computation, instead of exiting on first error
    export const getValidation = <E>(S: Sg.Semigroup<E>): Applicative<ResultF<E>> => ({
        apply: dual(2, <A, B>(self: Either<E, A>, fab: Either<E, (a: A) => B>): Either<E, B> => {
            return self.isLeft()
                ? fab.isLeft()
                    ? Either.left(S.concat(self.getLeft(), fab.getLeft()))
                    : (self as any)
                : fab.isLeft()
                    ? (fab as any)
                    : Either.right(fab.get()(self.get()))
        }),
        of: Either.right,
        map: ResultM.map,
    })

    export const of = <A>(a: A): Result<A> => Either.right<Error, A>(a)

    export const mapLeft =
        <A, E, E2>(f: (e: E) => E2) =>
            (self: Result<A, E>): Result<A, E2> =>
                self.mapLeft(f)

    export const flatMap = ResultM.flatMap

    export const unwrap = <A>(result: Either<A, A>): A =>
        result.match({
            Left: identity,
            Right: identity,
        })


    //export const forAll = Arr.mapN(getValidation(Sg.from<Error>((x, y) => new Error([x.message, y.message].join(', ')))))
    export const sequence = ArrayM.sequence(ResultM)
    //export const traverse = ArrayM.traverse(ResultM)
}
