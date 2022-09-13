import Image from "next/future/image";
import Link from "next/link";
import { ArrowUpRight } from "phosphor-react";
import React from "react";
import { TWITTER_URL, WAITLIST_URL } from "src/constants";
import theme from "src/styleguide/theme";
import Box from "./Box";
import Text from "./Text";

const Navbar = () => {
  return (
    <Box py="mxl" position="fixed" top="0" width="100vw">
      <Box width={{ mobS: "90vw", deskM: "128rem" }} mx="auto" between>
        <Link href="/" passHref>
          <Image
            src="/brand.svg"
            alt="schmint"
            width={120}
            height={30}
            style={{ cursor: "pointer" }}
          />
        </Link>
        <Box row alignItems="center">
          <Box
            as="a"
            href={TWITTER_URL}
            target="_blank"
            row
            alignItems="center"
            color="simply-black"
            cursor="pointer"
            display={{ mobS: "none", deskM: "flex" }}
            css={`
              &:hover {
                color: ${theme.colors["blue-40"]};
              }
            `}
          >
            <Text as="nav" mr="2px">
              Twitter
            </Text>
            <ArrowUpRight size={16} weight="bold" />
          </Box>
          {/* <Box
            as="a"
            href={WAITLIST_URL}
            target="_blank"
            border="none"
            height="4rem"
            bg="blue-40"
            color="gray-10"
            borderRadius="64px"
            px="mxl"
            ml={{ mobS: "0", deskM: "wxs" }}
            cursor="pointer"
            center
            css={`
              &:hover {
                background: ${theme.colors["blue-50"]};
              }
            `}
          >
            <Text as="b2">Enter Waitlist</Text>
          </Box> */}
          <Box
            as="a"
            href={WAITLIST_URL}
            target="_blank"
            ml="wxs"
            row
            alignItems="center"
            color="simply-black"
            cursor="pointer"
            display={{ mobS: "none", deskM: "flex" }}
            css={`
              &:hover {
                color: ${theme.colors["blue-40"]};
              }
            `}
          >
            <Text as="nav" mr="2px">
              Enter Waitlist
            </Text>
            <ArrowUpRight size={16} weight="bold" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
