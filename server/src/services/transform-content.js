'use strict';

const markdownToTxt = require('markdown-to-txt');

function transformMarkdownToText(md) {
    let text = md;
    try {
        text = markdownToTxt(md);
    }
    catch(err) {
        console.error('strapi-plugin-elasticsearch : Error while transforming markdown to text.');
        console.error(err);
    }
    return text;
}

module.exports = {
    transform({content, from}) {
        if (from === 'markdown')
            return transformMarkdownToText(content);
        else
            return from;
    },
};