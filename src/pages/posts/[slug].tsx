import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import { getPrismicClient } from "../../services/prismic"
import { RichText } from 'prismic-dom'
import Head from "next/head"

import styles from './post.module.scss'

interface PostProps {
    post: {
        slug: string
        title: string
        content: string
        updatedAt: string
    }
}

export default function Post({ post }: PostProps){
    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>
                        {
                            new Date(post.updatedAt).toLocaleDateString('pt-BR',{
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })
                        }
                    </time>

                    <div
                        dangerouslySetInnerHTML={{ __html: post.content }}
                        className={styles.postContent}
                    />
                </article>
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    const session = await getSession({ req })
    const { slug } = params 

    if(!session?.activeSubscription) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    const prismic = getPrismicClient()

    const response = await prismic.getByUID('publication' , String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: response.last_publication_date
    }

    return {
        props: {
            post
        }
    }
}