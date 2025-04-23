import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import {
  getUserDetailsWithInvestmentInfoAsync,
  getUserGenerationTreeAsync,
} from '../../features/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';
import Loader from '../../common/Loader';
import Tree from 'react-d3-tree';
import { ICONS } from '../../constants';
import Icon from '../../components/Icons/Icon';
import './ViewUserGeneration.css';
import { API_URL } from '../../api/routes';

function viewUserGeneration() {
  const { id } = useParams<{ id: string }>();
  const userId = id as string;

  const dispatch = useDispatch<AppDispatch>();
  const { currentUser: loggedInUser } = useSelector(
    (state: RootState) => state.auth,
  );
  const { userGenerationTree, user: selectedUserDetail } = useSelector(
    (state: RootState) => state.user,
  );

  const [treeData, setTreeData] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userGenerationTreeLoading, setUserGenerationTreeLoading] =
    useState<boolean>(false);
  const [selectedUserDetailsLoading, setSelectedUserDetailsLoading] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchUserGenerationTree = async () => {
      if (!userId) return;
      setUserGenerationTreeLoading(true);
      try {
        await dispatch(getUserGenerationTreeAsync(userId)).unwrap();
      } catch (error: any) {
        toast.error(error?.message || 'Server error');
      } finally {
        setUserGenerationTreeLoading(false);
      }
    };

    fetchUserGenerationTree();
  }, [dispatch, userId]);

  useEffect(() => {
    if (
      !loggedInUser ||
      !Array.isArray(userGenerationTree) ||
      userGenerationTree.length === 0
    )
      return;

    const userMap = new Map();

    userGenerationTree.forEach((user) =>
      userMap.set(user._id, {
        name: user.username,
        attributes: { Level: 0 },
        children: [],
        rawData: user,
        collapsed: false,
      }),
    );

    userGenerationTree.forEach((user) => {
      if (user.sponsorUCode && userMap.has(user.sponsorUCode)) {
        const parent = userMap.get(user.sponsorUCode);
        const child = userMap.get(user._id);
        child.attributes.Level = parent.attributes.Level + 1;
        parent.children.push(child);
      }
    });

    setTreeData(userMap.get(userId) || null);
  }, [userGenerationTree, userId]);

  const renderCustomNodeElement = ({
    nodeDatum,
    toggleNode,
  }: {
    nodeDatum: any;
    toggleNode: () => void;
  }) => {
    return (
      <g>
        {nodeDatum.children?.length > 0 && (
          <circle
            r={15}
            className="cursor-pointer hover:scale-110 transition-transform"
            fill="rgb(77, 92, 177)"
            stroke="white"
            onClick={(e) => {
              e.stopPropagation();
              toggleNode();
            }}
          />
        )}
        <text
          x="-5"
          y="5"
          fill="black"
          stroke-width="1"
          fontSize="12"
          textAnchor="middle"
          className="cursor-pointer font-bold text-center darkmode-stroke"
          onClick={(e) => {
            e.stopPropagation();
            toggleNode();
          }}
        >
          {nodeDatum.collapsed ? '+' : '-'}
        </text>
        <rect
          x="-22"
          y="-52"
          width="44"
          height="44"
          fill="rgb(77, 92, 177)"
          rx="50%"
        />
        <image
          href={
            nodeDatum.rawData.profileImage ||
            'https://img.icons8.com/ios-filled/100/000000/user-male-circle.png'
          }
          x="-20"
          y="-50"
          height="40px"
          width="40px"
          className="tree_generation cursor-pointer hover:scale-110 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(nodeDatum.rawData);
          }}
        />

        <text
          x={25}
          y={-10}
          fill="black"
          stroke-width="1.5"
          className="cursor-pointer text-gray-900 dark:text-gray-100 darkmode-stroke"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(nodeDatum.rawData);
          }}
        >
          {nodeDatum.name} (L{nodeDatum.attributes.Level})
        </text>
      </g>
    );
  };

  useEffect(() => {
    if (!selectedUser) return;

    (async () => {
      setSelectedUserDetailsLoading(true);
      try {
        await dispatch(
          getUserDetailsWithInvestmentInfoAsync({ userId: selectedUser._id }),
        ).unwrap();
      } catch (error: any) {
        toast.error(error?.message || 'Server error');
      } finally {
        setSelectedUserDetailsLoading(false);
      }
    })();
  }, [selectedUser, dispatch]);

  return (
    <div>
      <Breadcrumb pageName="User Generation" />
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          User Team Hierarchy
        </h2>
        <div className="border p-4 rounded-lg bg-gray-100 dark:bg-darkCard h-[500px] shadow-lg darkmode_generation">
          {userGenerationTreeLoading ? (
            <Loader loader="ClipLoader" size={50} color="blue" />
          ) : treeData ? (
            <Tree
              data={treeData}
              orientation="vertical"
              translate={{ x: 300, y: 50 }}
              pathFunc="step"
              nodeSize={{ x: 200, y: 100 }}
              separation={{ siblings: 1.5, nonSiblings: 2 }}
              collapsible={true}
              renderCustomNodeElement={renderCustomNodeElement}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No downline members found.
            </p>
          )}
        </div>

        {selectedUser && (
          <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 !p-5 rounded-lg shadow-xl w-1/3">
                <h3 className="text-lg font-semibold mb-2 border-b-2 border-gray-300 text-gray-900 dark:text-gray-100">
                  User Details
                </h3>
                <div className="flex py-3">
                  {selectedUserDetailsLoading ? (
                    <Loader loader="ClipLoader" size={50} color="blue" />
                  ) : (
                    <div className="flex items-center gap-4">
                      {selectedUserDetail?.user?.profilePicture ? (
                        <img
                          src={`${API_URL}${selectedUserDetail?.user?.profilePicture}`}
                          alt="User"
                          className="w-14 h-14 rounded-full shadow-md"
                        />
                      ) : (
                        <Icon
                          Icon={ICONS.USER}
                          className="w-14 h-14 rounded-full shadow-md"
                        />
                      )}

                      <div className="text-gray-900 dark:text-gray-100">
                        <p>
                          <strong>Username:</strong>{' '}
                          {selectedUserDetail?.user?.username || 'N/A'}
                        </p>
                        <p>
                          <strong>Sponsor:</strong>{' '}
                          {selectedUserDetail?.user?.sponsorUCode?.username ||
                            'N/A'}
                        </p>
                        <p>
                          <strong>Package:</strong>{' '}
                          {selectedUserDetail?.totalInvestment || '0'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t-2 border-gray-300 pt-3">
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 w-full text-center"
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default viewUserGeneration;
