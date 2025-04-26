import { 
  Card, 
  CardBody, 
  CardHeader, 
  Image} from "@heroui/react"
import { motion } from "framer-motion"
import { useState } from "react"
import { Login } from "../../features/user/login"
import { useAuthGuard } from "../../hooks/useAuthGuard"
import { ErrorMessage } from "../../components/error-message"
import logo from "../../public/images/watermark.svg" // Добавьте свой логотип

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } }
}

export const Auth = () => {
  const [selected, setSelected] = useState("login")
  const [authError, setAuthError] = useState("")
  
  useAuthGuard()

  const handleAuthError = (error: string) => {
    setAuthError(error)
    setTimeout(() => setAuthError(""), 5000)
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={fadeIn}
      className="min-h-screen bg-gradient-to-br from-default-50 to-default-100 flex items-center justify-center p-4"
    >
      <div className="max-w-4xl w-full">
        <motion.div variants={item} className="flex justify-center mb-8">
          <Image
            src={logo}
            alt="Логотип"
            width={120}
            height={120}
            className="hover:scale-105 transition-transform"
          />
        </motion.div>

        <motion.div variants={item}>
          <Card className="max-w-md mx-auto shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6">
              <motion.h2 
                className="text-2xl font-bold text-white text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {"Админ-панель"}
              </motion.h2>
            </CardHeader>

            <CardBody className="p-6">

              <motion.div
                key={selected}
                initial={{ opacity: 0, x: selected === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {(
                  <Login 
                    setSelected={setSelected}
                    onError={handleAuthError}
                  />
                )}
                {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6"
                >
                  <ErrorMessage error={authError} />
                </motion.div>
              )}
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div 
          className="mt-8 text-center text-default-500 text-sm"
          variants={item}
        >
          <p>© {new Date().getFullYear()} Виртуальная лаборатория. Все права защищены.</p>
        </motion.div>
      </div>
    </motion.div>
  )
}