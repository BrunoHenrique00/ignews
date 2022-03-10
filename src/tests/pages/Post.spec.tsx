import { render , screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { getSession } from 'next-auth/client'
import Post from '../../pages/posts/[slug]'
import { getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/prismic')
jest.mock('next-auth/client')


describe('Post page', () => {
    it('should render correctly', () => {        

        render(
            <Post post={
                { slug: 'my-new-post', title: 'my title' , content: '<p>Post excerpt</p>' , updatedAt: 'fake-update'}
            }/>
        )
    
        expect(screen.getByText('my title')).toBeInTheDocument()
        expect(screen.getByText('Post excerpt')).toBeInTheDocument()
    })

    it('redirects user if no subscription is found', async () => {
        const getSessionMocked = mocked(getSession)

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: null
        })

        const response = await getServerSideProps({
            req: {
                cookies: {}
            },
            params: {
                slug: 'my-new-post'
            }
        } as  any)

        expect(response).toEqual(
            expect.objectContaining({
                redirect: {
                    destination: '/',
                    permanent: false
                }
            })
        )
    })

    it('loads initial data', async () => {
        const getSessionMocked = mocked(getSession)
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

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-subscription'
        })

        const response = await getServerSideProps({
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