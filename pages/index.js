import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import SingleTodo from "../components/SingleTodo";
import { supabaseClient } from "../lib/client";
import ManageTodo from "../components/ManageTodo";
import { useDisclosure } from "@chakra-ui/react";
import { Box, SimpleGrid, Text, HStack, Tag } from "@chakra-ui/react";

const Home = () => {
  const initialRef = useRef();
  const [todos, setTodos] = useState([]);
  const [todo, setTodo] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const router = useRouter();
  const user = supabaseClient.auth.user();

  useEffect(() => {
    if (!user) {
      router.push("/signin");
    }
  }, [user, router]);

  useEffect(() => {
    console.log("gettodos");
    if (user) {
      supabaseClient
        .from("todos")
        .select("*")
        .eq("user_id", user?.id)
        .order("id", { ascending: false })
        .then(({ data, error }) => {
          if (!error) {
            setTodos(data);
          }
        });
    }
  }, [user]);
  useEffect(() => {
    console.log("todoListener");
    const todoListener = supabaseClient
      .from("todos")
      .on("*", (payload) => {
        const newTodo = payload.new;
        setTodos((oldTodos) => {
          const newTodos = [...oldTodos, newTodo];
          newTodos.sort((a, b) => b.id - a.id);
          return newTodos;
        });
      })
      .subscribe();
    return () => {
      todoListener.unsubscribe();
    };
  }, []);

  const openHandler = (clickedTodo) => {
    setTodo(clickedTodo);
    onOpen();
  };

  const deleteHandler = async (todoId) => {
    setIsDeleteLoading(true);
    const { error } = await supabaseClient
      .from("todos")
      .delete()
      .eq("id", todoId);
    if (!error) {
      setTodos(todos.filter((todo) => todo.id !== todoId));
    }
    setIsDeleteLoading(false);
  };
  return (
    <div>
      <Head>
        <title>Todo App | Home</title>
        <meta name="description" content="todoapp in next.js and supabase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Navbar onOpen={onOpen} />
        <ManageTodo
          isOpen={isOpen}
          onClose={onClose}
          initialRef={initialRef}
          todo={todo}
          setTodo={setTodo}
        />
        <HStack m="10" spacing="4" justify="center">
          <Box>
            <Tag bg="green.500" borderRadius="3xl" size="sm" mt="1" /> Complete
          </Box>
          <Box>
            <Tag bg="yellow.400" borderRadius="3xl" size="sm" mt="1" />{" "}
            Incomplete
          </Box>
        </HStack>
        <SimpleGrid
          columns={{ base: 2, md: 3, lg: 4 }}
          gap={{ base: "4", md: "6", lg: "8" }}
          m="10"
        >
          {todos.map((todo) => (
            <SingleTodo
              todo={todo}
              key={todo.id}
              openHandler={openHandler}
              deleteHandler={deleteHandler}
              isDeleteLoading={isDeleteLoading}
            />
          ))}
        </SimpleGrid>
      </main>
    </div>
  );
};

export default Home;
