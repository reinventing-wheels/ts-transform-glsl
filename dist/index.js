"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const glsl = require("glsl-man");
const fs_1 = require("fs");
const path_1 = require("path");
const minifyShader = (shader) => {
    const ast = glsl.parse(shader);
    return glsl.string(ast, { tab: '', space: '', newline: '' });
};
const getNameIdentifier = (ic) => {
    return ic.namedBindings
        ? ts.isNamedImports(ic.namedBindings)
            ? ic.namedBindings.elements[0].name
            : ic.namedBindings.name
        : ic.name;
};
const makeConst = (name, value) => {
    const decl = ts.createVariableDeclaration(name, undefined, ts.createLiteral(value));
    const list = ts.createVariableDeclarationList(ts.createNodeArray([decl]), ts.NodeFlags.Const);
    return ts.createVariableStatement(undefined, list);
};
const transformImport = (node, cwd) => {
    if (!ts.isImportDeclaration(node))
        return;
    if (!node.importClause)
        return node;
    const name = getNameIdentifier(node.importClause).getText();
    const path = node.moduleSpecifier.getText().slice(1, -1);
    const resolved = path_1.resolve(path.startsWith('.') ? cwd : '.', path);
    if (/\.(?:glsl|vert|frag)$/i.test(path)) {
        const shader = fs_1.readFileSync(resolved, 'utf8');
        return makeConst(name, minifyShader(shader));
    }
    return node;
};
exports.default = () => ctx => sf => {
    const cwd = path_1.dirname(sf.fileName);
    const visitor = node => transformImport(node, cwd) ||
        ts.visitEachChild(node, visitor, ctx);
    return ts.visitNode(sf, visitor);
};
