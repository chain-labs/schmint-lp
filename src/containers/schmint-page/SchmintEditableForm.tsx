import { ethers } from 'ethers';
import { CaretDown, CaretUp, PencilSimple, Trash } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import Box from 'src/components/Box';
import ButtonComp from 'src/components/Button';
import If from 'src/components/If';
import Text from 'src/components/Text';
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import { schedulerSelector } from 'src/redux/scheduler';
import { userSelector } from 'src/redux/user';
import theme from 'src/styleguide/theme';
import { useContract, useFeeData, useNetwork, useProvider, useSigner } from 'wagmi';
import CostComp from '../project-page/components/CostComp';
import InputBox from '../project-page/components/InputBox';
import useScheduler from '../project-page/useScheduler';
import { getABIType } from '../project-page/utils';
import { getCoinPrice } from 'src/utils/gasPrices';
import { replaceModal, showModal } from 'src/redux/modal';
import { MODALS_LIST } from 'src/redux/modal/types';
import CounterInput from 'src/components/CounterInput';

const SchmintEditableForm = ({ collection, actionRequired, quantity, schmint, disabled }) => {
	const [showOptions, setShowOptions] = useState(false);
	const [nft, setNft] = useState(quantity);
	const [gasPriceLimit, setGasPriceLimit] = useState('');
	const [funds, setFunds] = useState('');
	const [estimatedGas, setEstimatedGas] = useState(0.001);
	const [txGas, setTxGas] = useState<string>('');
	const [txPrice, setTxPrice] = useState<string>('');
	const [step, setStep] = useState(0);
	// const [deleteschmint, setDeleteschmint] = useState<boolean>(false);
	let deleteschmint;

	const { data: signer } = useSigner();
	const provider = useProvider();
	const { data: gasFee } = useFeeData({
		formatUnits: 'gwei',
		watch: true,
	});

	const { chain } = useNetwork();
	const user = useAppSelector(userSelector);
	const scheduler = useAppSelector(schedulerSelector);
	const [editable, setEditable] = useState(false);

	useEffect(() => {
		setNft(quantity);
	}, []);

	const TargetInstance = useContract({
		addressOrName: collection?.contractAddress,
		contractInterface: collection?.abi,
		signerOrProvider: provider,
	});

	const dispatch = useAppDispatch();

	const SchedulerInstance = useScheduler();

	useEffect(() => {
		const total = (collection?.price * parseInt(nft) + estimatedGas).toFixed(3);
		setFunds(total);
	}, [nft]);

	const modifySchmint = async (e) => {
		e.preventDefault();

		dispatch(
			showModal({
				type: MODALS_LIST.CONFIRM_TRANSACTION,
				props: {
					title: 'Waiting for Confirmation',
					subtext: 'Confirm the wallet transaction to proceed.',
					gasCost: `${parseFloat(txGas).toFixed(6)} ${chain?.nativeCurrency?.symbol} or ${(
						parseFloat(txPrice) * parseFloat(txGas)
					).toFixed(2)} USD`,
				},
			})
		);

		try {
			let buyTx;

			switch (getABIType(collection.abi)) {
				case 1: {
					buyTx = await TargetInstance?.populateTransaction?.[collection.abi?.[0]?.name](
						scheduler.avatar,
						nft,
						{
							value: ethers.utils.parseUnits(`${collection.price * parseInt(nft)}`, 'ether'),
						}
					);
					break;
				}
				case 2: {
					buyTx = await TargetInstance?.populateTransaction?.[collection.abi?.[0]?.name](
						nft,
						scheduler.avatar,
						{
							value: ethers.utils.parseUnits(`${collection.price * parseInt(nft)}`, 'ether'),
						}
					);
					break;
				}
				case 3: {
					buyTx = await TargetInstance?.populateTransaction?.[collection.abi?.[0]?.name](nft, {
						value: ethers.utils.parseUnits(`${collection.price * parseInt(nft)}`, 'ether'),
					});
					break;
				}
			}
			const modifySchmintInput = [
				{
					schmintId: schmint?.schmintId,
					newValue: buyTx?.value,
					gasPriceLimit: gasPriceLimit ? ethers.utils.parseUnits(gasPriceLimit, 'gwei') : 0,
					data: buyTx?.data,
				},
			];

			const prevValue = parseFloat(ethers.utils.formatEther(schmint?.value));

			const fundsToBeAdded = ethers.utils.parseEther(
				Math.max(parseFloat((collection?.price * nft).toFixed(4)) - prevValue, 0).toString()
			);

			const tx = await SchedulerInstance?.connect(signer)?.modifySchmint(
				modifySchmintInput[0]?.schmintId,
				modifySchmintInput[0]?.newValue,
				modifySchmintInput[0]?.gasPriceLimit,
				modifySchmintInput[0]?.data,
				{
					value: fundsToBeAdded,
				}
			);

			dispatch(
				replaceModal({
					type: MODALS_LIST.CONFIRM_TRANSACTION,
					props: {
						title: 'Processing...',
						subtext: 'Please wait while your transaction is being processed.',
						loader: true,
					},
				})
			);

			const receipt = await tx?.wait();
			console.log(receipt);

			const event = receipt?.events && receipt.events.filter((event) => event.event === 'SchmintModified');
			if (!event) {
				console.log('no event found');
				return;
			} else {
				console.log({ event });
				dispatch(
					replaceModal({
						type: MODALS_LIST.STATUS_MODAL,
						props: {
							success: true,
							gas: `${txGas} ${chain?.nativeCurrency?.symbol} or ${(
								parseFloat(txPrice) * parseFloat(txGas)
							).toFixed(2)} USD`,
							msg: 'Successfully updated your Schmint preferences.',
							successMsg: 'Schmint Changes Saved.',
							btnText: 'Awesome!',
						},
					})
				);
			}
		} catch (err) {
			console.log({ err });

			dispatch(
				replaceModal({
					type: MODALS_LIST.STATUS_MODAL,
					props: {
						success: false,
					},
				})
			);
		}
	};

	const getEstimatedGas = async () => {
		try {
			let buyTx;

			switch (getABIType(collection.abi)) {
				case 1: {
					buyTx = await TargetInstance?.populateTransaction?.[collection.abi?.[0]?.name](
						scheduler.avatar,
						nft,
						{
							value: ethers.utils.parseUnits(`${collection.price * parseInt(nft)}`, 'ether'),
						}
					);
					break;
				}
				case 2: {
					buyTx = await TargetInstance?.populateTransaction?.[collection.abi?.[0]?.name](
						nft,
						scheduler.avatar,
						{
							value: ethers.utils.parseUnits(`${collection.price * parseInt(nft)}`, 'ether'),
						}
					);
					break;
				}
				case 3: {
					buyTx = await TargetInstance?.populateTransaction?.[collection.abi?.[0]?.name](nft, {
						value: ethers.utils.parseUnits(`${collection.price * parseInt(nft)}`, 'ether'),
					});
					break;
				}
			}

			const modifySchmintInput = [
				{
					schmintId: schmint?.schmintId,
					newValue: buyTx?.value,
					gasPriceLimit: gasPriceLimit ? ethers.utils.parseUnits(gasPriceLimit, 'gwei') : 0,
					data: buyTx?.data,
				},
			];
			const prevValue = parseFloat(ethers.utils.formatEther(schmint?.value));

			const fundsToBeAdded = ethers.utils.parseEther(
				Math.max(parseFloat((collection?.price * nft).toFixed(4)) - prevValue, 0).toString()
			);

			const tx = await SchedulerInstance?.connect(signer)?.estimateGas?.modifySchmint(
				modifySchmintInput[0].schmintId,
				modifySchmintInput[0].newValue,
				modifySchmintInput[0].gasPriceLimit,
				modifySchmintInput[0].data,
				{
					value: fundsToBeAdded,
				}
			);
			const totalEstimatedGasPrice = ethers.utils.formatEther(gasFee?.maxFeePerGas.mul(tx));
			getCoinPrice(chain?.id).then((price) => {
				setTxPrice(price);
			});
			setTxGas(totalEstimatedGasPrice);
		} catch (err) {
			console.log({ err });
		}
	};

	useEffect(() => {
		if (user.exists) {
			getEstimatedGas();
		}
	}, [nft, gasPriceLimit, funds, user, gasFee]);

	const deleteSchmint = async (e) => {
		e.preventDefault();
		dispatch(
			showModal({
				type: MODALS_LIST.DELETE_MODAL,
				props: {
					schmint: schmint,
					collectionName: collection.title,
				},
			})
		);
		if (deleteschmint) {
			dispatch(replaceModal({ type: MODALS_LIST.CONFIRM_TRANSACTION, props: {} }));

			try {
				const tx = await SchedulerInstance?.connect(signer)?.cancelSchmint(schmint.schmintId);
				const receipt = await tx?.wait();

				const event = receipt?.events && receipt.events.filter((event) => event.event === 'SchmintCreated');
				if (!event) {
					console.log('no event found');
					return;
				} else {
					console.log({ event });
					dispatch(
						replaceModal({
							type: MODALS_LIST.STATUS_MODAL,
							props: {
								success: true,
								msg: 'Your Schmint for Abstract 3D was successfully deleted.',
								btnText: 'Go Back to My Schmint',
							},
						})
					);
				}
			} catch (err) {
				console.log(err);
			}
		}
	};

	return (
		<Box width="54.8rem" px="mxl">
			<Box between mb="3rem">
				<Text as="h5">Schmint Details</Text>
				<ButtonComp
					backgroundColor="white"
					color="simply-black"
					width="9.5rem"
					height="3.2rem"
					borderRadius="99px"
					border={`1px solid ${theme.colors['gray-40']}`}
					row
					center
					onClick={() => setEditable(!editable)}
					disable={disabled}
				>
					<If
						condition={editable}
						then={<Text as="btn2">Cancel</Text>}
						else={
							<React.Fragment>
								<PencilSimple size={16} weight="fill" />
								<Text as="btn2" ml="mxxs">
									Edit
								</Text>
							</React.Fragment>
						}
					/>
				</ButtonComp>
			</Box>
			<CounterInput
				label="Number of NFTs"
				required
				bg={!editable ? (actionRequired ? 'yellow-20' : 'gray-20') : 'gray-10'}
				helper={`This contract allows upto ${collection.maxWallet} NFTs per wallet and ${collection.maxPurchase} per transaction.`}
				max={Math.min(collection?.maxPurchase) ?? 15}
				min={1}
				errorText={
					parseInt(nft) < 1
						? 'Value should not be less than 1'
						: parseInt(nft) < collection.maxPurchase
						? `Value should not be more than ${collection?.maxPurchase}`
						: ''
				}
				value={nft}
				setValue={setNft}
				disabled={!editable}
			/>
			<Text
				as="b3"
				onClick={() => setShowOptions(!showOptions)}
				cursor="pointer"
				my="3.3rem"
				color="blue-40"
				fontWeight="bold"
				row
				alignItems="center"
			>
				Show advanced options
				<Box as="span" ml="0.5rem" center>
					<If condition={showOptions === false} then={<CaretDown size={18} />} else={<CaretUp size={18} />} />
				</Box>
			</Text>
			<Box id="input">
				<If
					condition={showOptions === true}
					then={
						<Box>
							<InputBox
								label="Maximum Gas Price Limit"
								placeholder={!gasPriceLimit ? 'Not Set' : gasPriceLimit}
								value={gasPriceLimit}
								setValue={setGasPriceLimit}
								detailText="Your transaction will not execute if the gas price is more than the set limit."
								unit="GWEI"
								disabled={!editable}
								actionRequired={actionRequired}
							/>
						</Box>
					}
				/>
			</Box>
			<If
				condition={editable || actionRequired}
				then={
					<>
						<Box borderTop={`1px solid ${theme.colors['gray-30']}`} width="100%" mt="mxxxl" />
						<Text as="h5" mt="mxxl">
							Cost
						</Text>
						<CostComp
							collection={collection}
							nft={nft}
							showTotalAmount
							showCostText
							estimatedGas={estimatedGas}
							step={step}
							setStep={setStep}
							actionRequired={actionRequired}
							editable={editable}
							value={parseFloat(ethers.utils.formatUnits(schmint?.value, 'ether')) + estimatedGas}
						/>
					</>
				}
			/>

			<Box center between mt="wxs">
				<ButtonComp
					color="red-40"
					width="23.4rem"
					height="4.8rem"
					borderRadius="64px"
					border="1px solid"
					borderColor="gray-40"
					bg="tertiary"
					row
					center
					onClick={deleteSchmint}
					disable={disabled}
					css={`
						&:hover {
							background-color: ${theme.colors['red-40']};
						}

						&:disabled {
							background-color: ${theme.colors['gray-20']};
						}
					`}
				>
					<Trash size={24} />
					<Text as="btn1" ml="5px">
						Delete Schmint
					</Text>
				</ButtonComp>
				<ButtonComp
					bg="primary"
					color="white"
					width="23.4rem"
					height="4.8rem"
					borderRadius="64px"
					onClick={modifySchmint}
					disable={actionRequired ? false : !editable || (quantity === nft && !gasPriceLimit) || disabled}
				>
					<Text as="btn1">Save Changes</Text>
				</ButtonComp>
			</Box>
		</Box>
	);
};

export default SchmintEditableForm;
