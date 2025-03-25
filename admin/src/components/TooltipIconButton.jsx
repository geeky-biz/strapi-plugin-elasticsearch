import * as Tooltip from '@radix-ui/react-tooltip';
import { Typography, Box, IconButton } from "@strapi/design-system";


const TooltipIconButton = ({ children, label, variant, onClick, disabled, showBorder = false }) => {
    if (!label)
        return (
            <IconButton variant={variant} onClick={onClick} disabled={disabled} withTooltip={false}>
                {children}
            </IconButton>
        );

    const tooltipContent = (showBorder) ?
        <Box padding={4} margin={2} background="neutral0"
            hasRadius
            shadow="filterShadow">
            <Typography>
                {label}
            </Typography>
            <Tooltip.Arrow />
        </Box> :
        <>
            <Typography>
                {label}
            </Typography>
            <Tooltip.Arrow />
        </>;

    return (
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <IconButton variant={variant} onClick={onClick} disabled={disabled} withTooltip={false}>
                        {children}
                    </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content sideOffset={5}>
                        {tooltipContent}
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}

export default TooltipIconButton;