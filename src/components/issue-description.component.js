import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { ListItem } from 'react-native-elements';
import Parse from 'parse-diff';
import moment from 'moment/min/moment-with-locales.min';
import styled from 'styled-components/native';

import {
  StateBadge,
  MembersList,
  LabelButton,
  DiffBlocks,
  Button,
} from 'components';
import { translate } from 'utils';
import { colors, styledFonts, normalize } from 'config';
import { v3 } from 'api';

const styles = StyleSheet.create({
  badge: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-right: 10;
`;

const ContainerBorderBottom = styled.View`
  border-bottom-width: 1;
  border-bottom-color: ${colors.greyLight};
`;

const ListItemStyled = styled(ListItem)`
  color: ${colors.primaryDark}
  font-family: ${styledFonts.fontPrimarySemiBold}
`;

const ListItemURL = ListItemStyled.extend`
  font-size: ${normalize(10)};
`;

const ListItemIssueTitle = ListItemStyled.extend`
  border-bottom-width: 0;
  flex: 1;
`;

const DiffBlocksContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10;
  padding-bottom: 10;
`;

const LabelButtonGroup = styled.View`
  flex-wrap: wrap;
  flex-direction: row;
  margin-left: 54;
  padding-bottom: 15;
`;

const AssigneesSection = styled.View`
  margin-left: 54;
  padding-bottom: 5;
`;

const MergeButtonContainer = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-vertical: 15;
`;

export class IssueDescription extends Component {
  props: {
    issue: Object,
    diff: string,
    isMergeable: boolean,
    isMerged: boolean,
    isPendingDiff: boolean,
    isPendingCheckMerge: boolean,
    onRepositoryPress: Function,
    userHasPushPermission: boolean,
    locale: string,
    navigation: Object,
  };

  renderLabelButtons = labels => {
    return labels
      .slice(0, 3)
      .map(label => <LabelButton key={label.id} label={label} />);
  };

  render() {
    const {
      diff,
      issue,
      isMergeable,
      isMerged,
      isPendingDiff,
      isPendingCheckMerge,
      onRepositoryPress,
      userHasPushPermission,
      locale,
      navigation,
    } = this.props;

    const filesChanged = Parse(diff);

    let lineAdditions = 0;
    let lineDeletions = 0;

    filesChanged.forEach(file => {
      lineAdditions += file.additions;
      lineDeletions += file.deletions;
    });

    return (
      <ContainerBorderBottom>
        {issue.repository_url && (
          <ListItemURL
            title={issue.repository_url.replace(`${v3.root}/repos/`, '')}
            leftIcon={{
              name: 'repo',
              size: 17,
              color: colors.grey,
              type: 'octicon',
            }}
            onPress={() => onRepositoryPress(issue.repository_url)}
            hideChevron
          />
        )}

        <HeaderContainer>
          <ListItemIssueTitle
            title={issue.title}
            subtitle={moment(issue.created_at).fromNow()}
            leftIcon={{
              name: issue.pull_request ? 'git-pull-request' : 'issue-opened',
              size: 36,
              color: colors.grey,
              type: 'octicon',
            }}
            hideChevron
          />

          {!issue.pull_request ||
            (issue.pull_request &&
              !isPendingCheckMerge && (
                <StateBadge
                  style={styles.badge}
                  issue={issue}
                  isMerged={isMerged && issue.pull_request}
                  locale={locale}
                />
              ))}
        </HeaderContainer>

        {issue.pull_request && (
          <DiffBlocksContainer>
            {isPendingDiff && (
              <ActivityIndicator animating={isPendingDiff} size="small" />
            )}

            {!isPendingDiff &&
              (lineAdditions !== 0 || lineDeletions !== 0) && (
                <DiffBlocks
                  additions={lineAdditions}
                  deletions={lineDeletions}
                  showNumbers
                  onPress={() =>
                    navigation.navigate('PullDiff', {
                      title: translate('repository.pullDiff.title', locale),
                      locale,
                      diff,
                    })}
                />
              )}
          </DiffBlocksContainer>
        )}

        {issue.labels &&
          issue.labels.length > 0 && (
            <LabelButtonGroup>
              {this.renderLabelButtons(issue.labels)}
            </LabelButtonGroup>
          )}
        {issue.assignees &&
          issue.assignees.length > 0 && (
            <AssigneesSection>
              <MembersList
                title={translate('issue.main.assignees', locale)}
                members={issue.assignees}
                containerStyle={{ marginTop: 0, paddingTop: 0, paddingLeft: 0 }}
                smallTitle
                navigation={navigation}
              />
            </AssigneesSection>
          )}

        {issue.pull_request &&
          !isMerged &&
          issue.state === 'open' &&
          userHasPushPermission && (
            <MergeButtonContainer>
              <Button
                type={isMergeable ? 'success' : 'default'}
                icon={{ name: 'git-merge', type: 'octicon' }}
                disabled={!isMergeable}
                onPress={() =>
                  navigation.navigate('PullMerge', {
                    title: translate('issue.pullMerge.title', locale),
                  })}
                title={translate('issue.main.mergeButton', locale)}
              />
            </MergeButtonContainer>
          )}
      </ContainerBorderBottom>
    );
  }
}
