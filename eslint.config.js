import globals from "globals";
import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        rules: {
            "indent": ["error", 4],
            "linebreak-style": [
                "warn",
                "windows"
            ],
            "quotes": [
                "error",
                "double"
            ],
            "require-await": ["error"],
            "comma-spacing": ["error"],
            "no-var": ["error"],
            "prefer-arrow-callback": ["error"],
            "curly": ["error"],
            "prefer-const": ["error"],
            "keyword-spacing": ["error"],
            "brace-style": ["error", "1tbs"],
            "arrow-body-style": ["error"],
            "max-len": ["error", { "code": 120 }],
            "space-before-blocks": ["error", "always"],
            "semi": ["error"],
            "no-multi-spaces": ["error"]
        }
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                __USE_SERVICE_WORKERS__: "readonly"
            }
        }
    },
    {
        ignores: ["old/*", "android/*", "docs/*"]
    }
];
