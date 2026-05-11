import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useMediaGallery } from './useMediaGallery'
import type { ChatMessage } from '@/store/chat-list'

describe('useMediaGallery', () => {
  it('skips background task system turns when collecting media', () => {
    const messages = ref<ChatMessage[]>([
      {
        id: 'system-task-1',
        role: 'system',
        kind: 'background_task',
        backgroundTask: {
          taskId: 'task-1',
          status: 'completed',
        },
        timestamp: '2026-05-11T10:00:00Z',
        streaming: false,
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        messages: [
          {
            id: 0,
            type: 'attachments',
            attachments: [
              {
                type: 'image',
                url: 'https://example.com/image.png',
              },
            ],
          },
        ],
        timestamp: '2026-05-11T10:00:01Z',
        streaming: false,
      },
    ])

    const gallery = useMediaGallery(messages)

    expect(() => gallery.items.value).not.toThrow()
    expect(gallery.items.value).toEqual([
      {
        src: 'https://example.com/image.png',
        type: 'image',
        name: undefined,
      },
    ])
  })
})
