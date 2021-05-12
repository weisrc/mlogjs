import { Compiler } from "./Compiler";

const code = `
const a = (a,b,c) => {
    return a + b + c
}
`;

console.log(new Compiler().compile(code));
