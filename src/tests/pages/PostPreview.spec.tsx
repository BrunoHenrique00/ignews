import { render , screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { getSession, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import Post from '../../pages/posts/preview/[slug]'
import { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/prismic')
jest.mock('next-auth/client')
jest.mock('next/router')

const post = { slug: 'my-new-post', title: 'my title' , content: '<p>Post excerpt</p>' , updatedAt: 'fake-update'}

describe('Post preview page', () => {
    it('should render correctly', () => {
        const useSessionMocked = mocked(useSession)
        
        useSessionMocked.mockReturnValueOnce([null, false])

        render(
            <Post post={post}/>
        )
    
        expect(screen.getByText('my title')).toBeInTheDocument()
        expect(screen.getByText('Post excerpt')).toBeInTheDocument()
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
    })

    it('redirects user to full post when subcribed', async () => {
        const useSessionMocked = mocked(useSession)
        const useRouterMocked = mocked(useRouter)

        const pushMocked = jest.fn()
        
        useSessionMocked.mockReturnValueOnce([
            { activeSubscription: 'fale-sub'},
            false
        ] as  any)

        useRouterMocked.mockReturnValueOnce({
            push: pushMocked
        } as any)

        render(
            <Post post={post}/>
        )

        expect(pushMocked).toHaveBeenCalledWith('/posts/my-new-post')
    })

    it('loads initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        { type: 'heading' , text: 'my new post'}
                    ],
                    content: [
                        { type: 'paragraph' , text: 'post excerpt'}
                    ]
                },
                last_publication_date: '04-01-2021'
            })
        } as any)

        const response = await getStaticProps({
            params: {
                slug: 'my-new-post'
            }
        } as  any)

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'my new post',
                        content: '<p>post excerpt</p>',
                        updatedAt: '04-01-2021'
                    }
                }
            })
        )
    })
})