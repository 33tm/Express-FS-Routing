import express, { Request, Response } from "express"
import { readdirSync, statSync } from "fs"
import { join } from "path"

const server = express()

export type Route = (req: Request, res: Response) => void

const importRoutes = (root: string) => {
    readdirSync(root).forEach(file => {
        const path = join(root, file)
        if (statSync(path).isDirectory()) return importRoutes(path)
        if (!file.endsWith(".ts")) return
        import(join(__dirname, path).slice(0, -3)).then(route => {
            const endpoint = path
                .slice(3, -3)
                .replace(/\[([^[\]]+)\]/g, ":$1")
                .replace(/\/index$/g, "") || "/"
            Object.entries(route).forEach(([method, handler]) => {
                if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) return
                server[method.toLowerCase()](endpoint, handler)
                console.log(`${method} ${endpoint}`)
            })
        })
    })
}

importRoutes("src")

server.listen(443, () => console.log("Server started"))