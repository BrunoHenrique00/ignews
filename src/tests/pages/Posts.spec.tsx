import { render , screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import Posts, { getStaticProps } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/prismic')


describe('Posts page', () => {
    it('should render correctly', () => {        

        render(
            <Posts posts={[
                { slug: 'my-new-post', title: 'my title' , excerpt: 'post excerpt' , updatedAt: 'fake-update'}
            ]}/>
        )
    
        expect(screen.getByText('my title')).toBeInTheDocument()
    })

    it('loads initial data', async () => {
        const prismicClientMocked = mocked(getPrismicClient)

        prismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [{
                    uid: 'my-new-post',
                    data: {
                        title: [
                            { type: 'heading' , text: 'my new post'}
                        ],
                        content: [
                            { type: 'paragraph' , text: 'post excerpt'}
                        ]
                    },
                    last_publication_date: '04-01-2021'
                }]
            })
        } as any)

        const response = await getStaticProps({})

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    posts: [{
                        slug: 'my-new-post',
                        title: 'my new post' ,
                        excerpt: 'post excerpt' ,
                        updatedAt: '04-01-2021'
                    }]
                }
            })
        )
    })
})