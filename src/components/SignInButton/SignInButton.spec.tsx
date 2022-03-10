import { render , screen } from '@testing-library/react'
import { useSession } from 'next-auth/client'
import { mocked } from 'jest-mock'
import SignInButton from '.'

jest.mock('next-auth/client')

describe('SignInButton component', () => {
    it('should render correctly when user is not authenticated', () => {
        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce([null,false])
        
        render(
            <SignInButton />
        )
    
        expect(screen.getByText('Sign in with Github')).toBeInTheDocument()
    })

    it('should render correctly when user is authenticated', () => {
        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce([{
            user: {
                email: 'john.doe@example.com',
                name: 'John Doe'
            },
            expires: 'fake-expires'
        },false])

        render(
            <SignInButton />
        )
    
        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
})