import { render , screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { signIn, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import Home, { getStaticProps } from '../../pages'
import { stripe } from '../../services/stripe'

jest.mock('next-auth/client')
jest.mock('next/router')
jest.mock('../../services/stripe')

describe('Home page', () => {
    it('should render correctly', () => {
        const useSessionMocked = mocked(useSession)
        
        useSessionMocked.mockReturnValueOnce([null, false])

        render(
            <Home product={{
                priceId: 'fake-price-id',
                amount: 'R$10,00'
            }}/>
        )
    
        expect(screen.getByText('for R$10,00 month')).toBeInTheDocument()
    })

    it('loads initial data', async () => {
        const retriveStripePricesMocked = mocked(stripe.prices.retrieve)

        retriveStripePricesMocked.mockResolvedValueOnce({
            id: 'fake-price-id',
            unit_amount: 1000,
        } as any)

        const response = await getStaticProps({})

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    product: {
                        priceId: 'fake-price-id',
                        amount: '$10.00',
                    }
                }
            })
        )
    })
})