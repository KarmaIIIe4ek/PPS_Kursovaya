import { Button, User } from "@heroui/react"

const App = () => {
  return (
    <div>
      <div className="flex flex-wrap gap-4 items-center m-10">
      <Button color="default">Default</Button>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="danger">Danger</Button>
    </div>
    <User
      avatarProps={{
        src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
      }}
      description="Product Designer"
      name="Jane Doe"
    />
    </div>
  )
}

export default App
