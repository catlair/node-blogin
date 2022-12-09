export default function () {
  return {
    presets: [
      [
        '@babel/env',
        {
          targets: {
            node: 14,
          },
        },
      ],
      '@babel/preset-typescript',
    ],
    comments: false,
    ignore: ['**/__test__', '**/*.test.ts', '**/*.spec.ts', '**/types', '**/dto'],
  };
}
