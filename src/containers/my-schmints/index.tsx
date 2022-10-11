import { useLazyQuery } from '@apollo/client';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { StarFour } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import Box from 'src/components/Box';
import If from 'src/components/If';
import Text from 'src/components/Text';
import GET_MY_SCHMINTS from 'src/graphql/query/GetMySchmints';
import { useAppSelector } from 'src/redux/hooks';
import { schedulerSelector } from 'src/redux/scheduler';
import { userSelector } from 'src/redux/user';
import theme from 'src/styleguide/theme';
import NoSchmintComponent from './NoSchmintComponent';
import SchmintsList from './SchmintsList';

const MySchmintComponent = () => {
	const { openConnectModal } = useConnectModal();
	const [page, setPage] = React.useState<0 | 1>(0);
	const [schmints, setSchmints] = useState([]);
	const [getSchmints, { loading, called }] = useLazyQuery(GET_MY_SCHMINTS, {
		onCompleted: ({ schmints }) => {
			setSchmints(schmints);
		},
	});
	const user = useAppSelector(userSelector);
	const scheduler = useAppSelector(schedulerSelector);

	useEffect(() => {
		if (user.address) {
			getSchmints({
				variables: {
					userId: user.address,
				},
			});
		}
	}, [user.address]);

	return (
		<Box px="mxl" py="wxs">
			<Box row alignItems="center" mb="wxs">
				<StarFour size={40} color={theme.colors['blue-40']} weight="fill" />
				<Text as="h4" ml="mxs">
					My Schmints
				</Text>
			</Box>
			<If
				condition={!scheduler.avatar || !user.exists}
				then={<NoSchmintComponent />}
				else={
					<React.Fragment>
						<Box mt="wxs" row alignItems="center">
							<Text
								as="h5"
								color={!page ? 'simply-blue' : 'gray-30'}
								onClick={() => setPage(0)}
								cursor="pointer"
							>
								Active
							</Text>
							<Box mx="mm" height="2rem" bg="gray-30" width="0.1rem" />
							<Text
								as="h5"
								color={page ? 'simply-blue' : 'gray-30'}
								onClick={() => setPage(1)}
								cursor="pointer"
							>
								Completed
							</Text>
						</Box>
						<SchmintsList page={page} schmints={schmints} />
					</React.Fragment>
				}
			/>
		</Box>
	);
};

export default MySchmintComponent;
