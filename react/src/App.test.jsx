import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import App from './App'

afterEach(() => {
  vi.useRealTimers()
})

describe('NYEF site navigation', () => {
  test('opens on the home page and navigates to About Us', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('button', { name: /become a member/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /about us/i }))
    expect(screen.getByRole('heading', { name: /who we are/i })).toBeInTheDocument()
  })

  test('uses the NYEF video behind the membership call to action', () => {
    const { container } = render(<App />)
    const memberButton = screen.getByRole('button', { name: /become a member/i })
    const hero = memberButton.closest('section')
    const video = container.querySelector('[data-main-video]')
    const videoBackdrop = container.querySelector('[data-video-backdrop]')

    expect(hero).toContainElement(video)
    expect(video).toHaveAttribute('src', '/assets/Nyef.mp4')
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('playsinline')
    expect(video).toHaveProperty('muted', true)
    expect(video).toHaveClass('object-contain', 'object-center', 'scale-110', 'drop-shadow-2xl')
    expect(videoBackdrop).toHaveClass('object-cover', 'blur-md', 'opacity-25')
    expect(container.querySelector('[data-video-layer]')).not.toBeInTheDocument()
    expect(hero).toHaveClass('bg-white')
    expect(hero).toHaveClass('w-full', 'h-[clamp(480px,42vw,700px)]')
    expect(memberButton.parentElement).toHaveClass('bottom-4', 'text-center')
    expect(screen.queryByText(/welcome to nyef sunsari/i)).not.toBeInTheDocument()
  })

  test('shows Sinet Rijal as the current homepage president', () => {
    render(<App />)

    expect(screen.getByRole('img', { name: /president sinet rijal/i })).toHaveAttribute('src', '/assets/team/sinetrijal.jpg')
    expect(screen.getByRole('heading', { name: /mr\. sinet rijal/i })).toBeInTheDocument()
    expect(screen.getByText('President, NYEF Sunsari (2026-2027)')).toBeInTheDocument()
  })

  test('opens a selected team collection', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /past presidents/i }))
    expect(screen.getByRole('heading', { name: /meet our team/i })).toBeInTheDocument()
    expect(screen.getByText(/immediate past president/i)).toBeInTheDocument()
  })

  test('shows all eighteen local gallery photos in order', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /gallery/i }))
    const photos = screen.getAllByRole('img', { name: /nyef sunsari event/i })
    expect(photos).toHaveLength(18)
    photos.forEach((photo, index) => {
      expect(photo).toHaveAttribute('src', `/assets/gallery/${index + 1}.jpg`)
    })
  })

  test('lists Rajiv Ghimire as immediate past president', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /past presidents/i }))
    expect(screen.getByRole('heading', { name: 'Mr. Rajiv Ghimire' })).toBeInTheDocument()
    expect(screen.getByText('Immediate Past President')).toBeInTheDocument()
    expect(screen.getByText('Term: 2025-2026')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mr. Siddhartha Shrestha' }).nextElementSibling).toHaveTextContent('Past President')
  })

  test('uses the local Chandra Devkota portrait', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /past presidents/i }))
    expect(screen.getByRole('img', { name: 'Mr. Chandra Devkota' })).toHaveAttribute('src', '/assets/team/chandra-devkota.jpg')
  })

  test('uses local portraits for Siddhartha, Santosh, and Sudip', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /past presidents/i }))
    expect(screen.getByRole('img', { name: 'Mr. Siddhartha Shrestha' })).toHaveAttribute('src', '/assets/team/siddhartha-shrestha.jpeg')
    expect(screen.getByRole('img', { name: 'Mr. Santosh Acharya' })).toHaveAttribute('src', '/assets/team/santosh-acharya.png')
    expect(screen.getByRole('img', { name: 'Mr. Sudip Ghimire' })).toHaveAttribute('src', '/assets/team/sudip-ghimire.png')
  })

  test('shows the 2026-27 executive committee in uppercase', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /executive committee/i }))
    expect(screen.getByRole('heading', { name: 'SINET RIJAL' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'RAJIV GHIMIRE' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'MISSION PARAJULI' })).toBeInTheDocument()
    expect(screen.getByText('IMMEDIATE PAST PRESIDENT')).toBeInTheDocument()
    expect(screen.getAllByText('EXECUTIVE MEMBER')).toHaveLength(9)
  })

  test('shows each executive committee member photo', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /executive committee/i }))
    const expectedPhotos = {
      'SINET RIJAL': '/assets/team/sinetrijal.jpg',
      'RAJIV GHIMIRE': '/assets/team/rajiv-ghimire.jpg',
      'RAKESH SHRESTHA': '/assets/team/rakesh-shrestha.jpg',
      'ABHISHEK BASNET': '/assets/team/abhishek-basnet.jpg',
      'AAKASH DULAL': '/assets/team/akash-dulal.jpg',
      'UTSHAB THAPA': '/assets/team/utshab-thapa.jpg',
      'JERMAN POUDEL': '/assets/team/jerman-poudel.jpg',
      'NISHANT KHEDIA': '/assets/team/nishant-khedia.jpg',
      'RAHUL BHANDARI': '/assets/team/rahul-bhandari.png',
      'AAVASH BHATTRAI': '/assets/team/aavash-bhandari.png',
      'BINITA POUDEL': '/assets/team/binita-poudel.png',
      'DIPESH SHRESTHA': '/assets/team/dipesh-shrestha.jpg',
      'MISSION PARAJULI': '/assets/team/mission-parajuli.png',
    }

    for (const [name, src] of Object.entries(expectedPhotos)) {
      const photo = screen.getByRole('img', { name })
      expect(photo).toHaveAttribute('src', src)
      expect(photo).toHaveClass(name === 'BINITA POUDEL' ? 'object-center' : 'object-top')
    }
  })

  test('frames Binita Poudel from her head through her shoulders', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /executive committee/i }))
    expect(screen.getByRole('img', { name: 'BINITA POUDEL' })).toHaveClass('object-center', 'scale-[1.5]', '-translate-y-[8%]')
  })

  test('crops the embedded border out of Dipesh Shrestha portrait', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /executive committee/i }))
    expect(screen.getByRole('img', { name: 'DIPESH SHRESTHA' })).toHaveClass('scale-[1.03]')
  })

  test('frames Mission Parajuli around his head and shoulders', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /executive committee/i }))
    expect(screen.getByRole('img', { name: 'MISSION PARAJULI' })).toHaveClass('scale-[1.35]', 'origin-top')
  })

  test('frames Rahul Bhandari around his head and shoulders', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /executive committee/i }))
    expect(screen.getByRole('img', { name: 'RAHUL BHANDARI' })).toHaveClass('scale-[1.25]', 'origin-top')
  })

  test('submits and resets the contact form', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^contact$/i }))
    await user.type(screen.getByLabelText(/full name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/email address/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/^message$/i), 'Hello NYEF')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/message has been sent/i)
    expect(screen.getByLabelText(/full name/i)).toHaveValue('')
  })

  test('dismisses the contact success message after three seconds', async () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /^contact$/i }))
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form'))
    expect(screen.getByRole('status')).toHaveTextContent(/message has been sent/i)

    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
