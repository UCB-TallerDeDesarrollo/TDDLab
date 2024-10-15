export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // Si usas módulos de ES6
      globals: {
        require: 'readonly',
        module: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        cy: 'readonly',
        expect: 'readonly',
        document: 'readonly',
        window: 'readonly',
      },
    },
    rules: {
      // Reglas relacionadas con el estilo de código
      quotes: ['error', 'single'], // Fuerza el uso de comillas simples
      semi: ['error', 'always'], // Requiere el uso de punto y coma al final de las líneas
      'object-curly-spacing': ['error', 'always'], // Requiere espacio dentro de llaves
      'array-bracket-spacing': ['error', 'never'], // No permite espacios dentro de corchetes

      // Reglas relacionadas con variables
      'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }], // No permite variables no usadas
      'no-undef': 'error', // No permite el uso de variables no definidas
      'no-var': 'error', // Fuerza el uso de `let` y `const` en vez de `var`
      'prefer-const': 'error', // Prefiere el uso de `const` cuando es posible

      // Reglas relacionadas con funciones y estructuras de control
      'no-shadow': 'error', // No permite variables con el mismo nombre en distintos contextos (shadowing)
      'consistent-return': 'error', // Fuerza consistencia en los valores retornados en una función
      curly: ['error', 'all'], // Requiere llaves para todas las declaraciones if/else/for/while
      eqeqeq: ['error', 'always'], // Requiere el uso de `===` en lugar de `==`

      // Reglas relacionadas con la accesibilidad
      'no-console': 'warn', // No permite el uso de `console.log`, advertencia en lugar de error
      'no-alert': 'error', // No permite el uso de `alert`, `confirm` y `prompt`
      
      // Reglas de rendimiento y buenas prácticas
      'no-multi-spaces': 'error', // No permite espacios múltiples en una línea
      'no-trailing-spaces': 'error', // No permite espacios al final de las líneas
      'no-whitespace-before-property': 'error', // No permite espacios en blanco antes de las propiedades
    },
  },
];
