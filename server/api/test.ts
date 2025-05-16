export default defineEventHandler(() => {
    const message = 'API is working!'
    console.log(message)
    return { message }
})