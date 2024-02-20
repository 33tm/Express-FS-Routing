import express, { Request, Response, json } from "express"
import { readdirSync, statSync } from "fs"

const server = express()

export type Route = (req: Request, res: Response) => void

const importRoutes = (root: string) => {
    readdirSync(root).forEach(file => {
        const path = `${root}/${file}`
        if (statSync(path).isDirectory()) return importRoutes(path)
        if (!file.endsWith(".ts")) return
        import(`./${path.slice(0, -3)}`).then(route => {
            const endpoint = path
                .slice(3, -3)
                .replace(/\[([^[\]]+)\]/g, ":$1")
                .replace(/\/index$/g, "") || "/"
            Object.entries(route).forEach(([method, handler]) => {
                if (!(method.toLowerCase() in server)) return
                server[method.toLowerCase() as keyof typeof server](endpoint, handler)
                console.log(`${method} ${endpoint}`)
            })
        })
    })
}

importRoutes("src")

server.use(json())

server.listen(443, () => console.log("Server started"))