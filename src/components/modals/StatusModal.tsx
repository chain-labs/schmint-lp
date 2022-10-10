import Image from 'next/image';
import React, { useEffect } from 'react';
import { useAppDispatch } from 'src/redux/hooks';
import { hideModal } from 'src/redux/modal';
import theme from 'src/styleguide/theme';
import { useNetwork } from 'wagmi';
import Box from '../Box';
import ButtonComp from '../Button';
import If from '../If';
import Modal from '../Modal';
import Text from '../Text';

const WarningIcon = 'https://ik.imagekit.io/chainlabs/Schmint/Warning_RlJNNAnXQ.svg';

const SuccessIcon = 'https://ik.imagekit.io/chainlabs/Schmint/DSC09095-02_Z8hCLrIV2.svg';

interface props {
	btnText: string;
	success?: boolean;
	msg: string;
	gas?: string;
}
const StatusModal = ({ btnText, success, msg, gas }: props) => {
	const dispatch = useAppDispatch();

	return (
		<Modal visible>
			<Box
				width="33.8rem"
				backgroundColor="white"
				p="1.6rem"
				position="absolute"
				top="50%"
				left="50%"
				transform="translate(-50%, -50%)"
				borderRadius="8px"
				column
			>
				<Box height="6.4rem" width="6.4rem" position="relative" mx="auto" mb="mm">
					<If
						condition={!success}
						then={<Image src={WarningIcon} layout="fill" objectFit="cover" />}
						else={<Image height={64} width={64} src={SuccessIcon} />}
					/>
				</Box>
				<Text as="h5" center>
					{success ? btnText : 'Transaction Unsuccessful'}
				</Text>
				<Text textAlign="center" as="b2" mt="mxs">
					{success ? msg : 'The transaction could not be validated or was cancelled from the wallet.'}
				</Text>

				{success ? (
					<Text as="c1" mt="ms" ml="mxxs" color="gray-50" px="wm" column center>
						<Box as="span" color="red-40">
							FINAL TRANSACTION COST :
						</Box>{' '}
						{gas}
					</Text>
				) : (
					''
				)}

				<If
					condition={!success}
					then={
						<Box row center mt="mxl">
							<ButtonComp
								bg="secondary"
								color="gray-60"
								width="14.5rem"
								height="4.8rem"
								borderRadius="64px"
								border={`1px solid ${theme.colors['gray-60']}`}
								onClick={() => {
									dispatch(hideModal());
								}}
							>
								<Text as="btn2">Cancel</Text>
							</ButtonComp>
							<ButtonComp
								bg="secondary"
								color="gray-60"
								width="14.5rem"
								height="4.8rem"
								borderRadius="64px"
								border={`1px solid ${theme.colors['gray-60']}`}
								onClick={() => {
									dispatch(hideModal());
								}}
							>
								<Text as="btn2">Retry</Text>
							</ButtonComp>
						</Box>
					}
				/>
				<Box center>
					<ButtonComp
						bg="primary"
						color="white"
						width="14.5rem"
						height="4.8rem"
						borderRadius="64px"
						onClick={() => dispatch(hideModal())}
						mx="auto"
					>
						{success ? btnText : 'Retry'}
					</ButtonComp>
				</Box>
			</Box>
		</Modal>
	);
};

export default StatusModal;
