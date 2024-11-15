import { Injectable } from '@angular/core';

import * as postcss from 'postcss';

@Injectable({
  providedIn: 'root',
})
export class CssVariableExtractorService {
  convertToCssVariables(css: string): { variables: any[]; updatedCss: string } {
    const root = postcss.parse(css, {});
    const variables: { name: string; value: string }[] = [];
    const updatedCss = root.clone();

    root.walkDecls((decl) => {
      const { prop, value, parent } = decl;
      if (
        !parent ||
        parent.type !== 'rule' ||
        (!value.startsWith('#') && !/^[a-z]+$/i.test(value))
      )
        return;

      const rule = parent as postcss.Rule;
      const varName = `--${rule.selector.replace(/[\W]+/g, '-')}-${prop.replace(
        /[\W]+/g,
        '-'
      )}`;
      variables.push({ name: varName, value });
      decl.value = `var(${varName})`;
    });

    return {
      variables,
      updatedCss: updatedCss.toString(),
    };
  }
}
