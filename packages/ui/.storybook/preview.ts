import '../src/styles.css'
import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'cream',
      values: [
        { name: 'cream', value: '#FFF3DF' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'navy', value: '#0D2B45' },
      ],
    },
  },
}

export default preview
